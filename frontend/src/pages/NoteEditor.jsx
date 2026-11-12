import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { assistText } from "../api/documents";
import { createNote, getNote, listNotes, updateNote } from "../api/notes";
import { errorMessage } from "../api/http";
import Icon from "../components/Icon";
import { PageLoading } from "../components/Loading";
import Markdown from "../components/Markdown";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { DEFAULT_CATEGORIES, NOTE_COLORS } from "../utils/constants";
import { wordCount } from "../utils/format";

const BLANK = { title: "", content: "", color: "#FFFFFF", category: "General", pinned: false };

const TOOLS = [
  { icon: "bold", label: "Bold", before: "**", after: "**", sample: "bold text" },
  { icon: "italic", label: "Italic", before: "_", after: "_", sample: "italic text" },
  { icon: "heading", label: "Heading", before: "## ", after: "", sample: "Heading", line: true },
  { icon: "list", label: "Bulleted list", before: "- ", after: "", sample: "List item", line: true },
  { icon: "checklist", label: "Checklist", before: "- [ ] ", after: "", sample: "Task", line: true },
  { icon: "quote", label: "Quote", before: "> ", after: "", sample: "Quote", line: true },
  { icon: "code", label: "Code", before: "`", after: "`", sample: "code" },
];

export default function NoteEditor() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const confirm = useConfirm();
  useDocumentTitle(editing ? "Edit note" : "New note");

  // "Save to notes" from a document arrives here with the text pre-filled.
  const prefill = location.state?.prefill;
  const initial = useMemo(() => ({ ...BLANK, ...prefill }), [prefill]);

  const [note, setNote] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("write");
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [error, setError] = useState("");
  const area = useRef(null);
  const [assist, setAssist] = useState(null); // { action, loading, result }

  const dirty = JSON.stringify(note) !== JSON.stringify(saved);

  useEffect(() => {
    if (!editing) return;
    getNote(id)
      .then((n) => {
        const loaded = {
          ...BLANK,
          ...n,
          color: n.color || BLANK.color,
          category: n.category || BLANK.category,
          pinned: !!n.pinned,
        };
        setNote(loaded);
        setSaved(loaded);
      })
      .catch((e) => {
        toast.error(errorMessage(e, "Couldn't open that note."));
        navigate("/notes", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, editing, navigate, toast]);

  // Offer categories the user already uses.
  useEffect(() => {
    listNotes()
      .then((all) =>
        setCategories(Array.from(new Set([...DEFAULT_CATEGORIES, ...all.map((n) => n.category)])))
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (patch) => setNote((n) => ({ ...n, ...patch }));

  const apply = (tool) => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const chosen = value.slice(s, e) || tool.sample;
    let start = s;
    if (tool.line && s > 0 && value[s - 1] !== "\n") {
      // Block markers belong at the start of a line.
      start = value.lastIndexOf("\n", s - 1) + 1;
    }
    const before = value.slice(0, start);
    const lead = tool.line ? value.slice(start, s) : "";
    const next = before + tool.before + lead + chosen + tool.after + value.slice(e);
    set({ content: next });
    requestAnimationFrame(() => {
      el.focus();
      const from = before.length + tool.before.length + lead.length;
      el.setSelectionRange(from, from + chosen.length);
    });
  };

  const runAssist = async (action) => {
    if (!note.content.trim()) return setError("Write something first, then ask for help.");
    setError("");
    setAssist({ action, loading: true });
    try {
      setAssist({ action, result: await assistText(note.content, action) });
    } catch (e) {
      setAssist(null);
      setError(errorMessage(e, "AI help isn't available right now.", "document service"));
    }
  };

  const save = useCallback(async () => {
    if (!note.title.trim()) return setError("Give your note a title.");
    if (!note.content.trim()) return setError("Write something in the note first.");
    setError("");
    setSaving(true);
    try {
      const payload = { ...note, title: note.title.trim().slice(0, 100) };
      const result = editing ? await updateNote(id, payload) : await createNote(payload);
      setSaved(note);
      toast.success(editing ? "Changes saved" : "Note saved");
      navigate(`/notes/${result.id}`, { replace: true, state: { fresh: true } });
    } catch (e) {
      setError(errorMessage(e, "Couldn't save the note.", "notes server"));
    } finally {
      setSaving(false);
    }
  }, [note, editing, id, navigate, toast]);

  // Cmd/Ctrl+S saves.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  const cancel = async () => {
    if (dirty) {
      const leave = await confirm({
        title: "Discard your changes?",
        body: "What you've written here hasn't been saved.",
        confirmLabel: "Discard",
        cancelLabel: "Keep editing",
        danger: true,
      });
      if (!leave) return;
    }
    navigate(editing ? `/notes/${id}` : "/notes");
  };

  if (loading) return <PageLoading label="Opening note…" />;

  const words = wordCount(note.content);

  return (
    <div className="page page-narrow">
      <Link to={editing ? `/notes/${id}` : "/notes"} className="back-link">
        <Icon name="back" size={16} /> {editing ? "Back to note" : "All notes"}
      </Link>

      <div className="editor card" style={note.color.toUpperCase() !== "#FFFFFF" ? { "--editor-tint": note.color } : undefined}>
        <input
          className="editor-title"
          placeholder="Title"
          value={note.title}
          maxLength={100}
          onChange={(e) => set({ title: e.target.value })}
          aria-label="Note title"
          autoFocus={!editing}
        />

        <div className="editor-bar">
          <div className="segmented" role="tablist" aria-label="Editor mode">
            <button role="tab" aria-selected={tab === "write"} className={tab === "write" ? "active" : ""} onClick={() => setTab("write")}>
              Write
            </button>
            <button role="tab" aria-selected={tab === "preview"} className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")}>
              Preview
            </button>
          </div>

          {tab === "write" && (
            <div className="tools" role="toolbar" aria-label="Formatting">
              {TOOLS.map((t) => (
                <button key={t.label} className="icon-btn" onClick={() => apply(t)} aria-label={t.label} title={t.label}>
                  <Icon name={t.icon} size={16} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="assist" role="group" aria-label="AI help">
          <span className="assist-label"><Icon name="sparkle" size={15} /> AI help</span>
          {[["summarize", "Summarize"], ["improve", "Improve writing"], ["expand", "Expand"], ["checklist", "Make checklist"]].map(([a, label]) => (
            <button key={a} className="chip" disabled={assist?.loading} onClick={() => runAssist(a)}>{label}</button>
          ))}
        </div>

        {assist && (
          <div className="assist-result" role="status">
            {assist.loading ? <span><span className="spinner" /> Thinking…</span> : (
              <>
                <Markdown>{assist.result}</Markdown>
                <div className="head-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => { set({ content: assist.result }); setAssist(null); }}>Replace my note</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { set({ content: `${note.content.trimEnd()}\n\n${assist.result}` }); setAssist(null); }}>Add below</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setAssist(null)}>Dismiss</button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "write" ? (
          <textarea
            ref={area}
            className="editor-body"
            placeholder="Start writing. Markdown works: **bold**, - lists, ## headings."
            value={note.content}
            onChange={(e) => set({ content: e.target.value })}
            aria-label="Note content"
          />
        ) : note.content.trim() ? (
          <Markdown className="editor-preview">{note.content}</Markdown>
        ) : (
          <p className="muted editor-preview">Nothing to preview yet.</p>
        )}

        <div className="editor-meta">
          <label className="field">
            <span>Category</span>
            <input
              className="input"
              list="category-options"
              value={note.category}
              maxLength={40}
              onChange={(e) => set({ category: e.target.value })}
            />
            <datalist id="category-options">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>

          <fieldset className="field">
            <legend>Colour</legend>
            <div className="swatches">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`swatch ${note.color.toUpperCase() === c.value ? "selected" : ""}`}
                  style={{ background: c.value }}
                  onClick={() => set({ color: c.value })}
                  aria-label={c.label}
                  aria-pressed={note.color.toUpperCase() === c.value}
                  title={c.label}
                />
              ))}
            </div>
          </fieldset>

          <label className="check">
            <input type="checkbox" checked={note.pinned} onChange={(e) => set({ pinned: e.target.checked })} />
            <span>Pin to the top of my notes</span>
          </label>
        </div>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}

        <div className="editor-foot">
          <small className="muted">
            {words} {words === 1 ? "word" : "words"} · {dirty ? "Unsaved changes" : "Saved"}
          </small>
          <div className="head-actions">
            <button className="btn btn-ghost" onClick={cancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Save note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
