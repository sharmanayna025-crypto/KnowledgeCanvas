from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import CORS_ORIGINS, GEMINI_API_KEY, GEMINI_MODEL
from app.database import Base, engine, migrate_legacy_schema
from app.models import document as _models  # noqa: F401  (registers tables)
from app.routes.document_routes import router
from app.services.gemini_service import AIServiceError

Base.metadata.create_all(bind=engine)
migrate_legacy_schema()

app = FastAPI(
    title="KnowledgeCanvas Documents API",
    description="PDF upload, search and Gemini-powered study tools.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AIServiceError)
async def ai_error_handler(_: Request, exc: AIServiceError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


app.include_router(router)


@app.get("/")
def home():
    return {"message": "KnowledgeCanvas Documents API is running"}


@app.get("/health")
def health():
    return {"status": "ok", "ai_configured": bool(GEMINI_API_KEY), "model": GEMINI_MODEL}
