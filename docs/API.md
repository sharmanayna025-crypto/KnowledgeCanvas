# API

All routes except `/auth/register` and `/auth/login` need `Authorization: Bearer <token>`.
Errors are JSON: Spring returns `{status, message}`, FastAPI returns `{detail}`.

## Notes backend (:8080)
| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | `{name,email,password}` → 201 user (409 if email taken, 400 if invalid) |
| POST | `/auth/login` | `{email,password}` → `{token, user}` (401 on bad credentials) |
| GET | `/auth/me` | current user |
| GET | `/notes` | pinned first, then newest |
| POST | `/notes` | `{title,content,color?,category?,pinned?}` |
| GET/PUT/DELETE | `/notes/{id}` | owner only, 404 otherwise |
| PATCH | `/notes/{id}/pin` | toggle pin |
| GET | `/notes/search?keyword=` | title or content |

## Document service (:8000)
| Method | Path | Notes |
|---|---|---|
| POST | `/upload` | multipart `file` (PDF, size-limited) |
| GET | `/documents` | lightweight list |
| GET | `/documents/{id}` | includes extracted `text` |
| GET | `/documents/{id}/file` | original PDF |
| DELETE | `/documents/{id}` | also removes the file |
| GET | `/search?query=` | hits with snippets |
| GET | `/summary/{id}` `/notes/{id}` `/quiz/{id}` | cached; add `?regenerate=true` |
| GET | `/flashcards/{id}` | cached; `[{front, back}]`, `?regenerate=true` |
| POST | `/assist` | `{text, action}` action: summarize, improve, expand, checklist → `{result}` |
| POST | `/chat/{id}` | `{question}` → `{answer}` |
| GET/DELETE | `/chat/{id}/history` | conversation |
| GET | `/health` | `ai_configured`, model |

Quiz = `[{question, options[4], answer:"A".."D", explanation}]`.
