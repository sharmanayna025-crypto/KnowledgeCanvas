"""
A tiny in-memory stand-in for the Spring Boot backend.

It speaks the same API (same routes, JSON shapes, status codes and JWT format),
so you can try the frontend and the document service without installing Java
or PostgreSQL. Data lives in memory and disappears when you stop it.

    pip install fastapi uvicorn PyJWT
    uvicorn mock_core_api:app --port 8080
"""
import hashlib
import os
import time
from datetime import datetime

import jwt
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

SECRET = os.getenv("JWT_SECRET", "knowledgecanvas_secret_key_123456789")

app = FastAPI(title="Mock KnowledgeCanvas core API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

users: dict[str, dict] = {}
notes: dict[int, dict] = {}
next_note_id = 1
bearer = HTTPBearer(auto_error=False)


def err(status: int, message: str):
    return JSONResponse(
        status_code=status,
        content={"timestamp": datetime.now().isoformat(), "status": status, "message": message},
    )


@app.exception_handler(HTTPException)
async def http_error(_: Request, exc: HTTPException):
    return err(exc.status_code, str(exc.detail))


def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def me(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if not credentials:
        raise HTTPException(401, "Unauthorized")
    try:
        email = jwt.decode(credentials.credentials, SECRET, algorithms=["HS256"])["sub"]
    except jwt.PyJWTError:
        raise HTTPException(401, "Unauthorized")
    if email not in users:
        raise HTTPException(401, "Unauthorized")
    return users[email]


class Register(BaseModel):
    name: str
    email: str
    password: str


class Login(BaseModel):
    email: str
    password: str


class NoteIn(BaseModel):
    title: str
    content: str
    color: str | None = None
    category: str | None = None
    pinned: bool | None = None


def public(u: dict) -> dict:
    return {"id": u["id"], "name": u["name"], "email": u["email"]}


@app.post("/auth/register", status_code=201)
def register(body: Register):
    email = body.email.strip().lower()
    if "@" not in email:
        raise HTTPException(400, "Enter a valid email address")
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be 6 to 72 characters")
    if email in users:
        raise HTTPException(409, "An account with this email already exists")
    users[email] = {"id": len(users) + 1, "name": body.name.strip(), "email": email, "pw": hash_pw(body.password)}
    return public(users[email])


@app.post("/auth/login")
def login(body: Login):
    user = users.get(body.email.strip().lower())
    if not user or user["pw"] != hash_pw(body.password):
        raise HTTPException(401, "Invalid email or password")
    now = int(time.time())
    token = jwt.encode({"sub": user["email"], "iat": now, "exp": now + 86400}, SECRET, algorithm="HS256")
    return {"token": token, "user": public(user)}


@app.get("/auth/me")
def whoami(user: dict = Depends(me)):
    return public(user)


def view(n: dict) -> dict:
    return {k: v for k, v in n.items() if k != "owner"}


def owned(note_id: int, user: dict) -> dict:
    n = notes.get(note_id)
    if not n or n["owner"] != user["email"]:
        raise HTTPException(404, "Note not found")
    return n


@app.get("/notes")
def list_notes(user: dict = Depends(me)):
    mine = [view(n) for n in notes.values() if n["owner"] == user["email"]]
    return sorted(mine, key=lambda n: (not n["pinned"], -datetime.fromisoformat(n["updatedAt"]).timestamp()))


@app.post("/notes")
def create_note(body: NoteIn, user: dict = Depends(me)):
    global next_note_id
    if not body.title.strip():
        raise HTTPException(400, "Title cannot be empty")
    if not body.content.strip():
        raise HTTPException(400, "Content cannot be empty")
    now = datetime.now().isoformat()
    note = {
        "id": next_note_id, "owner": user["email"], "title": body.title.strip(), "content": body.content,
        "color": body.color or "#FFFFFF", "category": body.category or "General",
        "pinned": bool(body.pinned), "createdAt": now, "updatedAt": now,
    }
    notes[next_note_id] = note
    next_note_id += 1
    return view(note)


@app.get("/notes/{note_id}")
def get_note(note_id: int, user: dict = Depends(me)):
    return view(owned(note_id, user))


@app.put("/notes/{note_id}")
def update_note(note_id: int, body: NoteIn, user: dict = Depends(me)):
    n = owned(note_id, user)
    n.update(title=body.title.strip(), content=body.content, color=body.color or "#FFFFFF",
             category=body.category or "General", updatedAt=datetime.now().isoformat())
    if body.pinned is not None:
        n["pinned"] = body.pinned
    return view(n)


@app.patch("/notes/{note_id}/pin")
def pin_note(note_id: int, user: dict = Depends(me)):
    n = owned(note_id, user)
    n["pinned"] = not n["pinned"]
    n["updatedAt"] = datetime.now().isoformat()
    return view(n)


@app.delete("/notes/{note_id}")
def delete_note(note_id: int, user: dict = Depends(me)):
    owned(note_id, user)
    del notes[note_id]
