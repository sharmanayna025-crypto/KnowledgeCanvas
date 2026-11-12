from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.auth import current_user
from app.database import get_db
from app.schemas import AssistRequest, ChatMessageOut, ChatRequest, DocumentOut, SearchHit
from app.services import document_service as svc
from app.services import gemini_service as ai

router = APIRouter()


@router.post("/upload")
def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: str = Depends(current_user),
):
    return svc.upload_document(file, db, user)


@router.get("/documents", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db), user: str = Depends(current_user)):
    return svc.list_documents(db, user)


@router.get("/documents/{document_id}")
def get_document(document_id: int, db: Session = Depends(get_db), user: str = Depends(current_user)):
    return svc.get_document(db, document_id, user)


@router.delete("/documents/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db), user: str = Depends(current_user)):
    return svc.delete_document(db, document_id, user)


@router.get("/documents/{document_id}/file")
def download_pdf(document_id: int, db: Session = Depends(get_db), user: str = Depends(current_user)):
    path, name = svc.file_path(db, document_id, user)
    return FileResponse(path, media_type="application/pdf", filename=name, content_disposition_type="inline")


@router.get("/search", response_model=list[SearchHit])
def search(query: str, db: Session = Depends(get_db), user: str = Depends(current_user)):
    return svc.search_documents(db, query, user)


@router.get("/summary/{document_id}")
def summary(document_id: int, regenerate: bool = False, db: Session = Depends(get_db), user: str = Depends(current_user)):
    return svc.get_summary(db, document_id, user, regenerate)


@router.get("/notes/{document_id}")
def notes(document_id: int, regenerate: bool = False, db: Session = Depends(get_db), user: str = Depends(current_user)):
    return svc.get_notes(db, document_id, user, regenerate)


@router.get("/quiz/{document_id}")
def quiz(document_id: int, regenerate: bool = False, db: Session = Depends(get_db), user: str = Depends(current_user)):
    return svc.get_quiz(db, document_id, user, regenerate)


@router.post("/chat/{document_id}")
def ask(document_id: int, body: ChatRequest, db: Session = Depends(get_db), user: str = Depends(current_user)):
    return svc.chat(db, document_id, body.question, user)


@router.get("/chat/{document_id}/history", response_model=list[ChatMessageOut])
def history(document_id: int, db: Session = Depends(get_db), user: str = Depends(current_user)):
    return svc.chat_history(db, document_id, user)


@router.delete("/chat/{document_id}/history")
def clear_history(document_id: int, db: Session = Depends(get_db), user: str = Depends(current_user)):
    return svc.clear_chat(db, document_id, user)


@router.get("/flashcards/{document_id}")
def flashcards(document_id: int, regenerate: bool = False, db: Session = Depends(get_db), user: str = Depends(current_user)):
    return svc.get_flashcards(db, document_id, user, regenerate)


@router.post("/assist")
def assist(body: AssistRequest, user: str = Depends(current_user)):
    return {"result": ai.assist(body.text, body.action)}
