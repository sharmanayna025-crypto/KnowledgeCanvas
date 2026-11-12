import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteNote, listNotes, togglePin } from "../api/notes";
import { errorMessage } from "../api/http";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import { SkeletonCards } from "../components/Loading";
import NoteCard from "../components/NoteCard";
import ServiceBanner from "../components/ServiceBanner";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { exportNotes, importNotes } from "../utils/backup";
import { plural, stripMarkdown } from "../utils/format";

const SORTS = {
  recent: "Recently edited",
  newest: "Newest first",
  oldest: "Oldest first",
  az: "Title A–Z",
};

export default function Notes() {
  useDocumentTitle("Notes");
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [params, setParams] = useSearchParams();

  const { data, loading, error, reload, setData } = useAsync(listNotes, []);
  const notes = data || [];

  const fileInput = useRef(null);
  const restore = async (file) => {
    if (!file) return;
    try {
      const { imported, failed } = await importNotes(file);
      toast.success(`Restored ${plural(imported, "note")}${failed ? `, ${failed} skipped` : ""}`);
      reload();
    } catch (e) {
      toast.error(e.message || "Couldn't restore that file.");
    }
    if (fileInput.current) fileInput.current.value = "";
  };

  const [query, setQuery] = useState("");
  const category = params.get("category") || "All";
  const sort = params.get("sort") || "recent";
  const [view, setView] = useState(() => localStorage.getItem("notesView") || "grid");

  const setParam = (key, value, fallback) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const changeView = (v) => {
    setView(v);
    localStorage.setItem("notesView", v);
  };

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(notes.map((n) => n.category))).sort()],
    [notes]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = notes.filter(
      (n) =>
        (category === "All" || n.category === category) &&
        (!q || n.title.toLowerCase().includes(q) || stripMarkdown(n.content).toLowerCase().includes(q))
    );
    const by = {
      recent: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      az: (a, b) => a.title.localeCompare(b.title),
    }[sort];
    return list.sort(by);
  }, [notes, query, category, sort]);

  const pinned = visible.filter((n) => n.pinned);
  const others = visible.filter((n) => !n.pinned);

  const pin = async (note) => {
    try {
      const updated = await togglePin(note.id);
      setData((list) => list.map((n) => (n.id === note.id ? updated : n)));
      toast.show(updated.pinned ? "Pinned to the top" : "Unpinned");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't pin that note."));
    }
  };

  const remove = async (note) => {
    const ok = await confirm({
      title: `Delete “${note.title}”?`,
      body: "This can't be undone.",
      confirmLabel: "Delete note",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteNote(note.id);
      setData((list) => list.filter((n) => n.id !== note.id));
      toast.success("Note deleted");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't delete that note."));
    }
  };

  const renderCards = (list) => (
    <div className={view === "list" ? "list-rows" : "grid-cards"}>
      {list.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          query={query}
          list={view === "list"}
          onPin={pin}
          onDelete={remove}
          onEdit={(n) => navigate(`/notes/${n.id}/edit`)}
        />
      ))}
    </div>
  );

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">Notes</h1>
          <p className="page-sub">{loading && !data ? "Loading…" : plural(notes.length, "note")}</p>
        </div>
        <div className="head-actions">
          {notes.length > 0 && (
            <button className="btn btn-ghost" onClick={() => exportNotes(notes)}>
              <Icon name="download" size={16} /> Back up
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => fileInput.current?.click()}>
            <Icon name="upload" size={16} /> Restore
          </button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(e) => restore(e.target.files?.[0])} />
          <button className="btn btn-primary" onClick={() => navigate("/notes/new")}>
            <Icon name="plus" size={16} /> New note
          </button>
        </div>
      </header>

      <ServiceBanner
        error={error}
        service="notes server"
        hint="cd backend && ./mvnw spring-boot:run"
        onRetry={reload}
      />

      {notes.length > 0 && (
        <div className="toolbar">
          <label className="search-field">
            <Icon name="search" size={16} />
            <input
              className="input"
              type="search"
              placeholder="Filter notes by title or text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Filter notes"
            />
          </label>

          <select
            className="select"
            value={sort}
            onChange={(e) => setParam("sort", e.target.value, "recent")}
            aria-label="Sort notes"
          >
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <div className="segmented" role="group" aria-label="Layout">
            <button
              className={view === "grid" ? "active" : ""}
              onClick={() => changeView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
            >
              <Icon name="grid" size={16} />
            </button>
            <button
              className={view === "list" ? "active" : ""}
              onClick={() => changeView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
            >
              <Icon name="list" size={16} />
            </button>
          </div>
        </div>
      )}

      {categories.length > 2 && (
        <div className="chips" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? "active" : ""}`}
              onClick={() => setParam("category", c, "All")}
              aria-pressed={category === c}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading && !data ? (
        <SkeletonCards />
      ) : notes.length === 0 && !error ? (
        <EmptyState
          icon="note"
          title="No notes yet"
          action={
            <button className="btn btn-primary" onClick={() => navigate("/notes/new")}>
              Write your first note
            </button>
          }
        >
          Jot down an idea, a lecture takeaway or a to-do list. Markdown works here.
        </EmptyState>
      ) : visible.length === 0 && notes.length > 0 ? (
        <EmptyState icon="search" title="Nothing matches">
          Try a different word, or switch the category back to “All”.
        </EmptyState>
      ) : (
        <>
          {pinned.length > 0 && (
            <section className="section">
              <h2 className="section-label">Pinned</h2>
              {renderCards(pinned)}
            </section>
          )}
          {others.length > 0 && (
            <section className="section">
              {pinned.length > 0 && <h2 className="section-label">Everything else</h2>}
              {renderCards(others)}
            </section>
          )}
        </>
      )}
    </div>
  );
}
