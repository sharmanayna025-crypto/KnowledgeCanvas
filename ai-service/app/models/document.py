from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    owner_email = Column(String, index=True, nullable=True)

    filename = Column(String, nullable=False)  # path on disk
    original_filename = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=False)

    page_count = Column(Integer, default=0)
    size_bytes = Column(Integer, default=0)

    summary = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    quiz = Column(Text, nullable=True)  # JSON string
    flashcards = Column(Text, nullable=True)  # JSON string

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    messages = relationship(
        "ChatMessage",
        back_populates="document",
        cascade="all, delete-orphan",
        order_by="ChatMessage.id",
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    document_id = Column(
        Integer, ForeignKey("documents.id", ondelete="CASCADE"), index=True
    )
    role = Column(String, nullable=False)  # "user" | "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="messages")
