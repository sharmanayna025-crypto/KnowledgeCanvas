import os

from dotenv import load_dotenv

load_dotenv()


def _bool(name: str, default: bool) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
# Tried in order if the configured model is retired or unavailable (404).
GEMINI_FALLBACK_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-2.5-flash"]
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").replace("models/", "")

JWT_SECRET = os.getenv("JWT_SECRET", "knowledgecanvas_secret_key_123456789")
AUTH_REQUIRED = _bool("AUTH_REQUIRED", True)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./documind.db")
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
MAX_UPLOAD_BYTES = int(float(os.getenv("MAX_UPLOAD_MB", "25")) * 1024 * 1024)

# Cap what we send to the model so one huge PDF can't create a runaway request.
MAX_AI_CHARS = int(os.getenv("MAX_AI_CHARS", "300000"))

CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if o.strip()
]
