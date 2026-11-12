"""All Gemini calls live here so the rest of the app never touches the SDK."""
import json
import re

from app.config import GEMINI_API_KEY, GEMINI_FALLBACK_MODELS, GEMINI_MODEL, MAX_AI_CHARS

_client = None
_working_model = None  # remembered after a successful call


class AIServiceError(Exception):
    """Raised when the model can't be reached or returns something unusable."""

    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def _get_client():
    global _client
    if not GEMINI_API_KEY:
        raise AIServiceError(
            "GEMINI_API_KEY is not set. Add it to ai-service/.env and restart the service.",
            503,
        )
    if _client is None:
        from google import genai

        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def _remember(model):
    global _working_model
    _working_model = model


def _clip(text: str) -> str:
    if len(text) <= MAX_AI_CHARS:
        return text
    return text[:MAX_AI_CHARS] + "\n\n[Document truncated for length]"


def _generate(prompt: str, as_json: bool = False) -> str:
    client = _get_client()
    config = None
    if as_json:
        from google.genai import types

        config = types.GenerateContentConfig(response_mime_type="application/json")
    candidates = [_working_model or GEMINI_MODEL] + [
        m for m in [GEMINI_MODEL, *GEMINI_FALLBACK_MODELS] if m != (_working_model or GEMINI_MODEL)
    ]
    last_error = None
    response = None
    for model in candidates:
        try:
            response = client.models.generate_content(model=model, contents=prompt, config=config)
            _remember(model)
            break
        except Exception as exc:  # SDK raises many error types
            last_error = exc
            text = str(exc)
            # Only a missing/retired model is worth retrying with another one.
            if "404" not in text and "NOT_FOUND" not in text:
                break
    if response is None:
        raise AIServiceError(f"The AI service couldn't complete that request: {last_error}")
    text = (response.text or "").strip()
    if not text:
        raise AIServiceError("The AI returned an empty answer. Try again.")
    return text


def generate_summary(text: str) -> str:
    return _generate(f"""You are an expert document summarizer.
Return ONLY Markdown in exactly this shape:

# Summary

## Overview
(2-3 short paragraphs in plain language)

## Key points
- ...

## Takeaways
- ...

Keep it between 150 and 250 words.

Document:
{_clip(text)}""")


def generate_notes(text: str) -> str:
    return _generate(f"""Turn this document into clean, well-organised study notes.
Return ONLY Markdown in this shape:

# Study notes

## <Topic>
- point
- point

## Key terms
- **Term**: meaning

Use as many topic sections as the document needs.

Document:
{_clip(text)}""")


def _normalise_quiz(raw: str) -> list[dict]:
    raw = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise AIServiceError("The quiz came back in an unexpected format. Try again.")

    if isinstance(data, dict):
        data = data.get("questions", [])

    questions = []
    for item in data if isinstance(data, list) else []:
        options = item.get("options")
        answer = str(item.get("answer", "")).strip().upper()[:1]
        if isinstance(options, dict):
            options = [options[k] for k in sorted(options)]
        if (
            not item.get("question")
            or not isinstance(options, list)
            or len(options) != 4
            or answer not in "ABCD"
            or not answer
        ):
            continue
        questions.append(
            {
                "question": str(item["question"]).strip(),
                "options": [re.sub(r"^[A-D][.)]\s*", "", str(o)).strip() for o in options],
                "answer": answer,
                "explanation": str(item.get("explanation", "")).strip(),
            }
        )

    if not questions:
        raise AIServiceError("Couldn't build a quiz from this document. Try again.")
    return questions


def generate_quiz(text: str) -> list[dict]:
    raw = _generate(
        f"""Create 10 multiple-choice questions that test understanding of this document.
Return ONLY a JSON array. Each item must look like:
{{"question": "...", "options": ["...", "...", "...", "..."], "answer": "B", "explanation": "one sentence on why"}}

Rules: exactly 4 options per question, no letter prefixes inside options,
"answer" is one letter A-D matching the options order, one clearly correct answer.

Document:
{_clip(text)}""",
        as_json=True,
    )
    return _normalise_quiz(raw)


NOT_FOUND = "I couldn't find that in this document."


def ask_document(text: str, question: str, history: list[tuple[str, str]]) -> str:
    convo = "\n".join(
        f"{'User' if role == 'user' else 'Assistant'}: {content}"
        for role, content in history[-8:]
    )
    return _generate(f"""Answer the user's question using ONLY the document below.
If the answer isn't in the document, reply exactly: {NOT_FOUND}
Reply in Markdown. Be concise and quote or point to the relevant part when useful.

Document:
{_clip(text)}

Conversation so far:
{convo or '(none)'}

User: {question}
Assistant:""")


def generate_flashcards(text: str) -> list[dict]:
    raw = _generate(
        f"""Create 12 flashcards covering the most important terms and ideas in this document.
Return ONLY a JSON array like [{{"front": "term or question", "back": "short answer"}}].
Keep each front under 15 words and each back under 35 words.

Document:
{_clip(text)}""",
        as_json=True,
    )
    raw = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise AIServiceError("The flashcards came back in an unexpected format. Try again.")
    if isinstance(data, dict):
        data = data.get("flashcards", [])
    cards = [
        {"front": str(c["front"]).strip(), "back": str(c["back"]).strip()}
        for c in (data if isinstance(data, list) else [])
        if isinstance(c, dict) and c.get("front") and c.get("back")
    ]
    if not cards:
        raise AIServiceError("Couldn't build flashcards from this document. Try again.")
    return cards


ASSIST_PROMPTS = {
    "summarize": "Summarize the note below in 3-5 concise bullet points.",
    "improve": "Rewrite the note below with clearer, tighter wording and fix grammar. Keep its meaning, structure and Markdown.",
    "expand": "Expand the note below with helpful detail and examples, keeping the same topic and Markdown style.",
    "checklist": "Turn the note below into a Markdown checklist of actionable items using '- [ ]'.",
}
MAX_ASSIST_CHARS = 20000


def assist(text: str, action: str) -> str:
    if action not in ASSIST_PROMPTS:
        raise AIServiceError("Unknown assist action.", 400)
    if not text.strip():
        raise AIServiceError("Write something first.", 400)
    return _generate(
        f"{ASSIST_PROMPTS[action]} Return ONLY the resulting Markdown, no preamble.\n\nNote:\n{text[:MAX_ASSIST_CHARS]}"
    )
