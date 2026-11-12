# Architecture

```
React (5173) ──► Spring Boot (8080) ──► PostgreSQL     auth, notes
     └────────► FastAPI (8000) ──► SQLite + uploads/ ──► Gemini
```
- Spring issues an HS256 JWT (`sub` = email). FastAPI verifies it with the same `JWT_SECRET` and scopes every document to that email.
- The frontend holds one token and talks to both services (`src/api/http.js`). Any 401 signs the user out with a notice.
- AI results (summary, notes, quiz) are cached on the document row; regenerate on demand. Chat history is stored per document.
- `ai-service/app/database.py` adds new columns to older SQLite files on startup.
- Long PDFs are truncated to `MAX_AI_CHARS` before being sent to the model.
