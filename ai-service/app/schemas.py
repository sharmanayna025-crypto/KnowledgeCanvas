from datetime import datetime

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: int
    original_filename: str
    page_count: int
    size_bytes: int
    characters: int
    preview: str
    has_summary: bool
    has_notes: bool
    has_quiz: bool
    has_flashcards: bool
    created_at: datetime | None


class SearchHit(BaseModel):
    id: int
    original_filename: str
    matches: int
    snippets: list[str]
    created_at: datetime | None


class ChatRequest(BaseModel):
    question: str


class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime | None


class AssistRequest(BaseModel):
    text: str
    action: str  # summarize | improve | expand | checklist
