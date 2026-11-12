# KnowledgeCanvas

**Never lose what you learn.** Notes and AI-assisted PDF study tools in one workspace.
This repo merges the original *KnowledgeCanvas* (notes) and *DocuMind* (PDF + Gemini) projects.

## What you get
- **Notes**: Markdown editor with preview, pinning, categories, colours, search, export to `.md`
- **Documents**: upload PDFs, then get a summary, study notes, an interactive quiz, flashcards, and a chat grounded in the PDF
- **Flashcards** from any PDF: flip, mark "I know this", shuffle; **AI help** in the note editor (summarize, improve, expand, checklist); **Back up / Restore** notes as JSON
- **One search** across notes and PDF text; "Save to notes" from any AI output
- Dark mode, mobile layout, one login for everything

## Layout
| Folder | What | Stack | Port |
|---|---|---|---|
| `frontend/` | Unified UI | React, Vite | 5173 |
| `backend/` | Auth + notes | Spring Boot 3, PostgreSQL, JWT | 8080 |
| `ai-service/` | PDFs + Gemini | FastAPI, SQLite | 8000 |
| `dev/` | In-memory stand-in for `backend/` | FastAPI | 8080 |

The two backends share one JWT secret, so signing in once works for both.

## Run it
> macOS: use `python3` (there is no `python` command). Keep each terminal tab open while its service runs. Frontend `.env` already points at `127.0.0.1`; open the app at http://localhost:5173.

**1. Database** (or skip to "Quick try" below): `docker compose up -d`

**2. Notes backend** (Java 21)
```bash
cd backend && ./mvnw spring-boot:run
```
**3. Document service** (Python 3.11+)
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```
Then open `ai-service/.env` and put your key after `GEMINI_API_KEY=` (restart the service after saving).
```text
```
**4. Frontend** (Node 20+)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 and create an account.

### Quick try without Java or Postgres
Run `dev/mock_core_api.py` instead of step 2 (`pip install -r dev/requirements.txt && uvicorn mock_core_api:app --app-dir dev --port 8080`). Notes live in memory only.

## Configuration
| Variable | Where | Default |
|---|---|---|
| `JWT_SECRET` | backend **and** ai-service (must match) | dev value, **change it** |
| `DB_URL` `DB_USERNAME` `DB_PASSWORD` | backend | local Postgres |
| `CORS_ORIGINS` | backend, ai-service | `localhost:5173` |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | ai-service | none, `gemini-3.8-flash` |
| `MAX_UPLOAD_MB` | ai-service | 25 |
| `VITE_CORE_API`, `VITE_AI_API` | frontend | `:8080`, `:8000` |

> The previous version committed a database password and JWT secret. They remain as fallback defaults so existing setups keep working. **Rotate them** and set the variables above for anything beyond local use.

## Tests
```bash
cd ai-service && pip install -r requirements-dev.txt && pytest
```
Swagger for the notes API: http://localhost:8080/swagger-ui.html. Documents API docs: http://localhost:8000/docs.

## Notes on existing data
- Old `documind.db` files are migrated automatically; documents uploaded before accounts existed are assigned to the first user who signs in.
- Scanned (image-only) PDFs are rejected with a clear message; OCR is not supported yet.


## Screenshots

**Home: recent notes and documents**

![Home: recent notes and documents](screenshots/12-home.png)

**Notes: pinned first, filters, colours**

![Notes: pinned first, filters, colours](screenshots/09-notes.png)

**Interactive quiz from any PDF**

![Interactive quiz from any PDF](screenshots/16-doc-quiz-answer.png)

More pages (editor, flashcards, chat, search, dark mode, mobile) are in the [`screenshots/`](screenshots) folder.

## Roadmap
OCR for scanned PDFs, tags and note links, spaced-repetition reviews, PDF export, deployment config.

Author: Nayna Sharma
