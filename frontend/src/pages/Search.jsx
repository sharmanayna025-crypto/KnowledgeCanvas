import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchDocuments } from "../api/documents";
import { listNotes } from "../api/notes";
import EmptyState from "../components/EmptyState";
import Highlight from "../components/Highlight";
import Icon from "../components/Icon";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { plural, stripMarkdown, timeAgo } from "../utils/format";

function noteSnippet(note, q) {
  const text = stripMarkdown(note.content);
  const at = text.toLowerCase().indexOf(q.toLowerCase());
  if (at < 0) return text.slice(0, 160);
  const start = Math.max(0, at - 60);
  return (start ? "…" : "") + text.slice(start, at + q.length + 100) + (at + q.length + 100 < text.length ? "…" : "");
}

export default function Search() {
  useDocumentTitle("Search");
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get("q") || "";
  const [input, setInput] = useState(urlQuery);
  const [notes, setNotes] = useState(null); // all notes, loaded once
  const [notesFailed, setNotesFailed] = useState(false);
  const [docHits, setDocHits] = useState([]);
  const [docsFailed, setDocsFailed] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => inputRef.current?.focus(), []);

  // Notes are searched in the browser: fetch them once, filter on every keystroke.
  useEffect(() => {
    listNotes()
      .then(setNotes)
      .catch(() => {
        setNotes([]);
        setNotesFailed(true);
      });
  }, []);

  // Keep the URL in sync (debounced) so a search can be bookmarked or shared.
  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = input.trim();
      if (trimmed !== urlQuery) setParams(trimmed ? { q: trimmed } : {}, { replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [input, urlQuery, setParams]);

  const q = urlQuery.trim();

  useEffect(() => {
    if (!q) {
      setDocHits([]);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    searchDocuments(q)
      .then((hits) => {
        if (!cancelled) {
          setDocHits(hits);
          setDocsFailed(false);
        }
      })
      .catch(() => !cancelled && (setDocHits([]), setDocsFailed(true)))
      .finally(() => !cancelled && setSearching(false));
    return () => {
      cancelled = true;
    };
  }, [q]);

  const noteHits = useMemo(() => {
    if (!q || !notes) return [];
    const needle = q.toLowerCase();
    return notes.filter(
      (n) => n.title.toLowerCase().includes(needle) || stripMarkdown(n.content).toLowerCase().includes(needle)
    );
  }, [notes, q]);

  const total = noteHits.length + docHits.length;

  return (
    <div className="page page-narrow">
      <header className="page-head">
        <div>
          <h1 className="page-title">Search</h1>
          <p className="page-sub">Look through your notes and the full text of your PDFs.</p>
        </div>
      </header>

      <label className="search-field search-big">
        <Icon name="search" size={20} />
        <input
          ref={inputRef}
          className="input"
          type="search"
          placeholder="Search for a word or phrase"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Search"
        />
      </label>

      {!q && (
        <EmptyState icon="search" title="What are you looking for?">
          Try a topic, a name or a phrase you remember. Tip: press <kbd>/</kbd> anywhere to jump here.
        </EmptyState>
      )}

      {q && (
        <p className="muted result-count" aria-live="polite">
          {searching && notes === null ? "Searching…" : `${plural(total, "result")} for “${q}”`}
        </p>
      )}

      {q && (notesFailed || docsFailed) && (
        <div className="banner banner-warn">
          <p>
            {notesFailed && docsFailed
              ? "Neither the notes server nor the document service is responding."
              : notesFailed
              ? "The notes server isn't responding, so notes are missing from these results."
              : "The document service isn't responding, so PDFs are missing from these results."}
          </p>
        </div>
      )}

      {q && noteHits.length > 0 && (
        <section className="section">
          <h2 className="section-label">Notes · {noteHits.length}</h2>
          <ul className="results">
            {noteHits.map((n) => (
              <li key={n.id}>
                <Link to={`/notes/${n.id}`} className="result">
                  <span className="result-icon">
                    <Icon name="note" size={18} />
                  </span>
                  <span className="result-body">
                    <strong>
                      <Highlight text={n.title} query={q} />
                    </strong>
                    <span>
                      <Highlight text={noteSnippet(n, q)} query={q} />
                    </span>
                    <small>
                      {n.category} · edited {timeAgo(n.updatedAt)}
                    </small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {q && docHits.length > 0 && (
        <section className="section">
          <h2 className="section-label">Documents · {docHits.length}</h2>
          <ul className="results">
            {docHits.map((d) => (
              <li key={d.id}>
                <Link to={`/documents/${d.id}`} className="result">
                  <span className="result-icon">
                    <Icon name="file" size={18} />
                  </span>
                  <span className="result-body">
                    <strong>
                      <Highlight text={d.original_filename} query={q} />
                    </strong>
                    {d.snippets.map((s, i) => (
                      <span key={i}>
                        <Highlight text={s} query={q} />
                      </span>
                    ))}
                    <small>{plural(d.matches, "match")} in the text</small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {q && !searching && notes !== null && total === 0 && !notesFailed && !docsFailed && (
        <EmptyState icon="search" title="No matches">
          Nothing contains “{q}”. Check the spelling or try a shorter word.
        </EmptyState>
      )}
    </div>
  );
}
