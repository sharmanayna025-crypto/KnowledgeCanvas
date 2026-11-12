import { Link, useNavigate } from "react-router-dom";
import { deleteDocument, listDocuments } from "../api/documents";
import { listNotes } from "../api/notes";
import DocCard from "../components/DocCard";
import Icon from "../components/Icon";
import { excerpt, greeting, plural, timeAgo } from "../utils/format";
import { isPlain } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../api/http";

export default function Home() {
  useDocumentTitle("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  const notes = useAsync(listNotes, []);
  const docs = useAsync(listDocuments, []);

  const noteList = notes.data || [];
  const docList = docs.data || [];
  const firstName = (user?.name || "").split(" ")[0];

  const recentNotes = [...noteList]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4);
  const recentDocs = docList.slice(0, 3);
  const pinned = noteList.filter((n) => n.pinned).length;
  const needsQuiz = docList.find((d) => !d.has_quiz);

  const loaded = !notes.loading && !docs.loading;
  const empty = loaded && noteList.length === 0 && docList.length === 0;

  const removeDoc = async (doc) => {
    const ok = await confirm({
      title: `Delete “${doc.original_filename}”?`,
      body: "The PDF, its summary, notes, quiz and chat will be removed for good.",
      confirmLabel: "Delete document",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteDocument(doc.id);
      docs.setData((list) => list.filter((d) => d.id !== doc.id));
      toast.success("Document deleted");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't delete that document."));
    }
  };

  return (
    <div className="page">
      <header className="page-head home-head">
        <div>
          <h1 className="page-title">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="page-sub">
            {empty
              ? "Your canvas is empty. Start with a note, or drop in a PDF to study."
              : loaded
              ? `${plural(noteList.length, "note")}${pinned ? ` (${pinned} pinned)` : ""} and ${plural(
                  docList.length,
                  "document"
                )} so far.`
              : "Getting your things ready…"}
          </p>
        </div>
        <div className="head-actions">
          <button className="btn btn-primary" onClick={() => navigate("/notes/new")}>
            <Icon name="plus" size={16} /> New note
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/documents")}>
            <Icon name="upload" size={16} /> Upload a PDF
          </button>
        </div>
      </header>

      {needsQuiz && (
        <Link to={`/documents/${needsQuiz.id}?tab=quiz`} className="nudge">
          <Icon name="quiz" size={20} />
          <span>
            <strong>Test yourself.</strong> Make a quiz from “{needsQuiz.original_filename}”.
          </span>
          <Icon name="back" size={16} className="flip" />
        </Link>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Recently edited</h2>
          {noteList.length > 0 && <Link to="/notes">All notes</Link>}
        </div>
        {notes.error ? (
          <p className="muted">Notes aren't loading right now. Check that the notes server is running.</p>
        ) : recentNotes.length === 0 && loaded ? (
          <p className="muted">
            Nothing here yet. <Link to="/notes/new">Write your first note</Link>.
          </p>
        ) : (
          <div className="grid-cards compact">
            {recentNotes.map((note) => {
              const tinted = !isPlain(note.color);
              return (
                <article
                  key={note.id}
                  className={`card note-card ${tinted ? "tinted" : ""}`}
                  style={tinted ? { background: note.color } : undefined}
                >
                  <span className="pill">{note.category}</span>
                  <h3 className="note-title">
                    <Link to={`/notes/${note.id}`} className="card-link">
                      {note.title}
                    </Link>
                  </h3>
                  <p className="note-excerpt">{excerpt(note.content, 110)}</p>
                  <footer className="note-card-foot">
                    <time>Edited {timeAgo(note.updatedAt)}</time>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Documents</h2>
          {docList.length > 0 && <Link to="/documents">All documents</Link>}
        </div>
        {docs.error ? (
          <p className="muted">
            Documents aren't loading right now. Check that the document service is running.
          </p>
        ) : recentDocs.length === 0 && loaded ? (
          <p className="muted">
            No PDFs yet. <Link to="/documents">Upload one</Link> to get a summary, notes and a quiz.
          </p>
        ) : (
          <div className="grid-cards compact">
            {recentDocs.map((d) => (
              <DocCard key={d.id} doc={d} onDelete={removeDoc} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
