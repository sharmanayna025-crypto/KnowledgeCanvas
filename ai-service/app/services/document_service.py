import io
import json
import os
import re
import uuid

from fastapi import HTTPException, UploadFile
from pypdf import PdfReader
from pypdf.errors import PdfReadError
from sqlalchemy.orm import Session

from app.config import MAX_UPLOAD_BYTES, UPLOAD_FOLDER
from app.models.document import ChatMessage, Document
from app.schemas import DocumentOut, SearchHit
from app.services import gemini_service as ai

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ---------- helpers ----------

def to_out(doc: Document) -> DocumentOut:
    text = doc.extracted_text or ""
    return DocumentOut(
        id=doc.id,
        original_filename=doc.original_filename,
        page_count=doc.page_count or 0,
        size_bytes=doc.size_bytes or 0,
        characters=len(text),
        preview=re.sub(r"\s+", " ", text[:260]).strip(),
        has_summary=bool(doc.summary),
        has_notes=bool(doc.notes),
        has_quiz=bool(doc.quiz),
        has_flashcards=bool(doc.flashcards),
        created_at=doc.created_at,
    )


def _owned(db: Session, document_id: int, owner: str) -> Document:
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.owner_email == owner)
        .first()
    )
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc


# ---------- CRUD ----------

def upload_document(file: UploadFile, db: Session, owner: str) -> dict:
    name = os.path.basename(file.filename or "document.pdf")
    if not name.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")

    data = file.file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            413, f"That file is larger than {MAX_UPLOAD_BYTES // (1024 * 1024)} MB."
        )
    if not data.startswith(b"%PDF"):
        raise HTTPException(400, "That file doesn't look like a valid PDF.")

    try:
        reader = PdfReader(io.BytesIO(data))
        if reader.is_encrypted:
            raise HTTPException(400, "This PDF is password-protected.")
        pages = [(page.extract_text() or "") for page in reader.pages]
    except HTTPException:
        raise
    except (PdfReadError, ValueError, KeyError) as exc:
        raise HTTPException(400, f"Couldn't read this PDF: {exc}")

    text = "\n\n".join(p.strip() for p in pages if p.strip())
    if not text:
        raise HTTPException(
            422,
            "No selectable text found. This looks like a scanned PDF, and OCR isn't supported yet.",
        )

    stored = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4().hex}.pdf")
    with open(stored, "wb") as fh:
        fh.write(data)

    doc = Document(
        owner_email=owner,
        filename=stored,
        original_filename=name,
        extracted_text=text,
        page_count=len(pages),
        size_bytes=len(data),
    )
    try:
        db.add(doc)
        db.commit()
        db.refresh(doc)
    except Exception:
        db.rollback()
        os.remove(stored)
        raise

    return {"message": "Document uploaded", "document": to_out(doc)}


def list_documents(db: Session, owner: str, claim_legacy: bool = True):
    if claim_legacy:
        # Documents uploaded before accounts existed belong to whoever signs in first.
        orphans = db.query(Document).filter(Document.owner_email.is_(None))
        if orphans.count():
            orphans.update({Document.owner_email: owner})
            db.commit()
    docs = (
        db.query(Document)
        .filter(Document.owner_email == owner)
        .order_by(Document.created_at.desc(), Document.id.desc())
        .all()
    )
    return [to_out(d) for d in docs]


def get_document(db: Session, document_id: int, owner: str) -> dict:
    doc = _owned(db, document_id, owner)
    out = to_out(doc).model_dump()
    out["text"] = doc.extracted_text
    return out


def delete_document(db: Session, document_id: int, owner: str) -> dict:
    doc = _owned(db, document_id, owner)
    path = doc.filename
    db.delete(doc)
    db.commit()
    if path and os.path.isfile(path):
        os.remove(path)
    return {"message": "Deleted"}


def file_path(db: Session, document_id: int, owner: str) -> tuple[str, str]:
    doc = _owned(db, document_id, owner)
    if not doc.filename or not os.path.isfile(doc.filename):
        raise HTTPException(404, "The original PDF is no longer on disk.")
    return doc.filename, doc.original_filename


# ---------- search ----------

def search_documents(db: Session, query: str, owner: str) -> list[SearchHit]:
    query = query.strip()
    if not query:
        return []
    pattern = re.compile(re.escape(query), re.IGNORECASE)
    hits = []
    docs = db.query(Document).filter(Document.owner_email == owner).all()
    for doc in docs:
        text = doc.extracted_text or ""
        found = list(pattern.finditer(text))
        in_name = bool(pattern.search(doc.original_filename))
        if not found and not in_name:
            continue
        snippets = []
        for m in found[:3]:
            start, end = max(0, m.start() - 70), min(len(text), m.end() + 90)
            snippet = re.sub(r"\s+", " ", text[start:end]).strip()
            snippets.append(("…" if start else "") + snippet + ("…" if end < len(text) else ""))
        hits.append(
            SearchHit(
                id=doc.id,
                original_filename=doc.original_filename,
                matches=len(found),
                snippets=snippets,
                created_at=doc.created_at,
            )
        )
    hits.sort(key=lambda h: h.matches, reverse=True)
    return hits


# ---------- AI outputs ----------

def _generated(db, document_id, owner, field, maker, regenerate, decode=None):
    doc = _owned(db, document_id, owner)
    cached = getattr(doc, field)
    if cached and not regenerate:
        try:
            return decode(cached) if decode else cached
        except ValueError:
            pass  # old/invalid cache: fall through and regenerate
    result = maker(doc.extracted_text)
    setattr(doc, field, json.dumps(result) if decode else result)
    db.commit()
    return result


def get_summary(db, document_id, owner, regenerate=False):
    return {"summary": _generated(db, document_id, owner, "summary", ai.generate_summary, regenerate)}


def get_notes(db, document_id, owner, regenerate=False):
    return {"notes": _generated(db, document_id, owner, "notes", ai.generate_notes, regenerate)}


def get_quiz(db, document_id, owner, regenerate=False):
    def decode(raw):
        data = json.loads(raw)
        if not isinstance(data, list):
            raise ValueError("legacy quiz")
        return data

    return {"quiz": _generated(db, document_id, owner, "quiz", ai.generate_quiz, regenerate, decode)}


# ---------- chat ----------

def chat(db: Session, document_id: int, question: str, owner: str) -> dict:
    question = question.strip()
    if not question:
        raise HTTPException(400, "Ask a question first.")
    doc = _owned(db, document_id, owner)
    history = [(m.role, m.content) for m in doc.messages]
    answer = ai.ask_document(doc.extracted_text, question, history)
    db.add(ChatMessage(document_id=doc.id, role="user", content=question))
    db.add(ChatMessage(document_id=doc.id, role="assistant", content=answer))
    db.commit()
    return {"answer": answer}


def chat_history(db: Session, document_id: int, owner: str):
    return _owned(db, document_id, owner).messages


def clear_chat(db: Session, document_id: int, owner: str) -> dict:
    doc = _owned(db, document_id, owner)
    db.query(ChatMessage).filter(ChatMessage.document_id == doc.id).delete()
    db.commit()
    return {"message": "Chat cleared"}


def get_flashcards(db, document_id, owner, regenerate=False):
    def decode(raw):
        data = json.loads(raw)
        if not isinstance(data, list):
            raise ValueError("bad cache")
        return data

    return {"flashcards": _generated(db, document_id, owner, "flashcards", ai.generate_flashcards, regenerate, decode)}
