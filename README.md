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

Every page, with sample data. The original-PDF tab isn't shown because headless browsers can't render embedded PDFs. Fonts shown are system fallbacks; the app loads Bricolage Grotesque and Instrument Sans from Google Fonts.

### Getting started

**Sign in**

![Sign in](screenshots/01-login.png)

**Create account**

![Create account](screenshots/02-register.png)

**Home, first visit**

![Home, first visit](screenshots/03-home-empty.png)

**Notes, empty**

![Notes, empty](screenshots/04-notes-empty.png)

**Documents, empty**

![Documents, empty](screenshots/05-documents-empty.png)


### Notes and home

**Note editor (Markdown, colours, pin)**

![Note editor (Markdown, colours, pin)](screenshots/06-note-editor.png)

**Editor preview**

![Editor preview](screenshots/07-note-editor-preview.png)

**Note view**

![Note view](screenshots/08-note-details.png)

**Notes (pinned first, filters)**

![Notes (pinned first, filters)](screenshots/09-notes.png)

**Notes, list view**

![Notes, list view](screenshots/10-notes-list-view.png)

**Documents**

![Documents](screenshots/11-documents.png)

**Home**

![Home](screenshots/12-home.png)

**AI help in the editor**

![AI help in the editor](screenshots/22-note-ai-help.png)


### Document study tools

**Document workspace**

![Document workspace](screenshots/13-doc-before-generating.png)

**AI summary**

![AI summary](screenshots/14-doc-summary.png)

**AI study notes**

![AI study notes](screenshots/15-doc-study-notes.png)

**Quiz, answering**

![Quiz, answering](screenshots/16-doc-quiz-answer.png)

**Quiz results and review**

![Quiz results and review](screenshots/17-doc-quiz-results.png)

**Flashcard, question**

![Flashcard, question](screenshots/18-doc-flashcard-front.png)

**Flashcard, answer**

![Flashcard, answer](screenshots/19-doc-flashcard-back.png)

**Chat with the PDF**

![Chat with the PDF](screenshots/20-doc-chat-empty.png)

**Chat answer**

![Chat answer](screenshots/21-doc-chat.png)


### Search and dialogs

**Search across notes and PDFs**

![Search across notes and PDFs](screenshots/23-search.png)

**Delete confirmation**

![Delete confirmation](screenshots/24-confirm-delete.png)

**Page not found**

![Page not found](screenshots/25-not-found.png)


### Dark mode

**Dark mode: home**

![Dark mode: home](screenshots/26-dark-home.png)

**Dark mode: notes**

![Dark mode: notes](screenshots/27-dark-notes.png)

**Dark mode: quiz**

![Dark mode: quiz](screenshots/28-dark-quiz.png)


### Mobile

**Mobile: sign in**

![Mobile: sign in](screenshots/29-mobile-login.png)

**Mobile: home**

![Mobile: home](screenshots/30-mobile-home.png)

**Mobile: notes**

![Mobile: notes](screenshots/31-mobile-notes.png)

**Mobile: flashcards**

![Mobile: flashcards](screenshots/32-mobile-flashcards.png)

## Roadmap
OCR for scanned PDFs, tags and note links, spaced-repetition reviews, PDF export, deployment config.

Author: Nayna Sharma
