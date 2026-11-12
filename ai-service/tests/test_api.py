import io
import json
import time

import jwt
import pytest
from fastapi.testclient import TestClient
from reportlab.pdfgen import canvas

from app.main import app
from app.services import gemini_service as ai

SECRET = "knowledgecanvas_secret_key_123456789"
client = TestClient(app)


def token(email="a@example.com", ttl=3600):
    # Same shape Spring's JwtService produces: HS256, sub=email.
    return jwt.encode({"sub": email, "iat": int(time.time()), "exp": int(time.time()) + ttl}, SECRET, algorithm="HS256")


def auth(email="a@example.com"):
    return {"Authorization": f"Bearer {token(email)}"}


def make_pdf(text="Photosynthesis converts light energy into chemical energy in plants."):
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(72, 750, text)
    c.showPage()
    c.drawString(72, 750, "Chlorophyll is the pigment that absorbs light.")
    c.save()
    return buf.getvalue()


@pytest.fixture(autouse=True)
def fake_ai(monkeypatch):
    monkeypatch.setattr(ai, "_generate", lambda prompt, as_json=False: (
        json.dumps([{"question": f"Q{i}?", "options": ["A. x", "B. y", "C. z", "D. w"], "answer": "b", "explanation": "because"} for i in range(3)])
        if as_json else "# Generated\n\nHello"
    ))


def upload(name="bio.pdf", data=None, headers=None):
    return client.post("/upload", files={"file": (name, data or make_pdf(), "application/pdf")}, headers=headers or auth())


def test_requires_auth():
    assert client.get("/documents").status_code == 401
    assert client.get("/documents", headers={"Authorization": "Bearer junk"}).status_code == 401
    expired = {"Authorization": f"Bearer {token(ttl=-10)}"}
    r = client.get("/documents", headers=expired)
    assert r.status_code == 401 and "expired" in r.json()["detail"]


def test_upload_list_get_delete():
    r = upload()
    assert r.status_code == 200, r.text
    doc = r.json()["document"]
    assert doc["page_count"] == 2 and "Photosynthesis" in doc["preview"]

    listed = client.get("/documents", headers=auth()).json()
    assert [d["id"] for d in listed] == [doc["id"]]
    assert "text" not in listed[0]  # list stays lightweight

    full = client.get(f"/documents/{doc['id']}", headers=auth()).json()
    assert "Chlorophyll" in full["text"]

    pdf = client.get(f"/documents/{doc['id']}/file", headers=auth())
    assert pdf.status_code == 200 and pdf.content.startswith(b"%PDF")

    assert client.delete(f"/documents/{doc['id']}", headers=auth()).status_code == 200
    assert client.get(f"/documents/{doc['id']}", headers=auth()).status_code == 404


def test_users_cannot_see_each_others_documents():
    doc = upload(headers=auth("owner@example.com")).json()["document"]
    other = auth("intruder@example.com")
    assert client.get(f"/documents/{doc['id']}", headers=other).status_code == 404
    assert client.get(f"/summary/{doc['id']}", headers=other).status_code == 404
    assert client.delete(f"/documents/{doc['id']}", headers=other).status_code == 404
    assert client.get("/documents", headers=other).json() == []


def test_upload_validation():
    assert upload("notes.txt", b"hello").status_code == 400
    assert upload("fake.pdf", b"not a pdf").status_code == 400
    blank = io.BytesIO(); c = canvas.Canvas(blank); c.showPage(); c.save()
    r = upload("scan.pdf", blank.getvalue())
    assert r.status_code == 422 and "scanned" in r.json()["detail"]


def test_search_is_case_insensitive_with_snippets():
    upload(headers=auth("s@example.com"))
    hits = client.get("/search", params={"query": "CHLOROPHYLL"}, headers=auth("s@example.com")).json()
    assert hits and hits[0]["matches"] == 1 and "hlorophyll" in hits[0]["snippets"][0]
    assert client.get("/search", params={"query": "zzzz"}, headers=auth("s@example.com")).json() == []


def test_ai_outputs_are_cached_and_regenerable(monkeypatch):
    h = auth("ai@example.com")
    doc = upload(headers=h).json()["document"]
    assert client.get(f"/summary/{doc['id']}", headers=h).json()["summary"].startswith("# Generated")

    calls = []
    monkeypatch.setattr(ai, "generate_summary", lambda t: calls.append(1) or "# New")
    assert client.get(f"/summary/{doc['id']}", headers=h).json()["summary"].startswith("# Generated")  # cached
    assert not calls
    assert client.get(f"/summary/{doc['id']}?regenerate=true", headers=h).json()["summary"] == "# New"

    quiz = client.get(f"/quiz/{doc['id']}", headers=h).json()["quiz"]
    assert len(quiz) == 3 and quiz[0]["answer"] == "B" and quiz[0]["options"][0] == "x"  # prefixes stripped, letter upper-cased


def test_chat_keeps_history():
    h = auth("chat@example.com")
    doc = upload(headers=h).json()["document"]
    assert client.post(f"/chat/{doc['id']}", json={"question": "  "}, headers=h).status_code == 400
    assert client.post(f"/chat/{doc['id']}", json={"question": "What is chlorophyll?"}, headers=h).status_code == 200
    hist = client.get(f"/chat/{doc['id']}/history", headers=h).json()
    assert [m["role"] for m in hist] == ["user", "assistant"]
    client.delete(f"/chat/{doc['id']}/history", headers=h)
    assert client.get(f"/chat/{doc['id']}/history", headers=h).json() == []


def test_missing_api_key_is_a_clear_error(monkeypatch):
    monkeypatch.undo()  # drop the fake
    monkeypatch.setattr(ai, "GEMINI_API_KEY", "")
    h = auth("nokey@example.com")
    doc = upload(headers=h).json()["document"]
    r = client.get(f"/summary/{doc['id']}", headers=h)
    assert r.status_code == 503 and "GEMINI_API_KEY" in r.json()["detail"]


def test_legacy_database_is_migrated():
    from sqlalchemy import create_engine, inspect, text
    import app.database as dbmod

    engine = create_engine("sqlite://")
    with engine.begin() as c:  # the ORIGINAL DocuMind schema
        c.execute(text("CREATE TABLE documents (id INTEGER PRIMARY KEY, filename VARCHAR NOT NULL, original_filename VARCHAR NOT NULL, extracted_text TEXT NOT NULL, summary TEXT, notes TEXT, quiz TEXT, created_at DATETIME)"))
        c.execute(text("INSERT INTO documents (filename, original_filename, extracted_text) VALUES ('uploads/x.pdf','old.pdf','legacy text')"))
    real = dbmod.engine
    dbmod.engine = engine
    try:
        dbmod.migrate_legacy_schema()
    finally:
        dbmod.engine = real
    cols = {c["name"] for c in inspect(engine).get_columns("documents")}
    assert {"owner_email", "page_count", "size_bytes"} <= cols


def test_flashcards_cached_and_validated(monkeypatch):
    h = auth("fc@example.com")
    doc = upload(headers=h).json()["document"]
    monkeypatch.setattr(ai, "_generate", lambda p, as_json=False: json.dumps([{"front": "Chlorophyll?", "back": "Light pigment"}, {"front": "", "back": "x"}]))
    cards = client.get(f"/flashcards/{doc['id']}", headers=h).json()["flashcards"]
    assert cards == [{"front": "Chlorophyll?", "back": "Light pigment"}]
    assert client.get("/documents", headers=h).json()[0]["has_flashcards"] is True
    assert client.get(f"/flashcards/{doc['id']}", headers=auth("other@example.com")).status_code == 404


def test_assist(monkeypatch):
    h = auth("as@example.com")
    monkeypatch.setattr(ai, "_generate", lambda p, as_json=False: "- point")
    assert client.post("/assist", json={"text": "hello", "action": "summarize"}, headers=h).json() == {"result": "- point"}
    assert client.post("/assist", json={"text": "hello", "action": "nope"}, headers=h).status_code == 400
    assert client.post("/assist", json={"text": " ", "action": "improve"}, headers=h).status_code == 400
    assert client.post("/assist", json={"text": "x", "action": "improve"}).status_code == 401
