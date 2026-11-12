import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteNote, getNote, togglePin } from "../api/notes";
import { errorMessage } from "../api/http";
import Icon from "../components/Icon";
import { PageLoading } from "../components/Loading";
import Markdown from "../components/Markdown";
import ServiceBanner from "../components/ServiceBanner";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { isPlain } from "../utils/constants";
import { copyText, downloadText } from "../utils/files";
import { formatDate, slugify, timeAgo, wordCount } from "../utils/format";

export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const { data: note, loading, error, reload, setData } = useAsync(() => getNote(id), [id]);
  useDocumentTitle(note?.title || "Note");

  if (loading && !note) return <PageLoading label="Opening note…" />;

  if (error) {
    const missing = error.response?.status === 404;
    return (
      <div className="page page-narrow">
        <Link to="/notes" className="back-link">
          <Icon name="back" size={16} /> All notes
        </Link>
        {missing ? (
          <div className="empty">
            <h3>That note isn't here</h3>
            <p>It may have been deleted.</p>
          </div>
        ) : (
          <ServiceBanner error={error} service="notes server" onRetry={reload} />
        )}
      </div>
    );
  }

  const tinted = !isPlain(note.color);

  const pin = async () => {
    try {
      setData(await togglePin(note.id));
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't pin that note."));
    }
  };

  const remove = async () => {
    const ok = await confirm({
      title: `Delete “${note.title}”?`,
      body: "This can't be undone.",
      confirmLabel: "Delete note",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteNote(note.id);
      toast.success("Note deleted");
      navigate("/notes", { replace: true });
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't delete that note."));
    }
  };

  const copy = async () =>
    toast.show((await copyText(`# ${note.title}\n\n${note.content}`)) ? "Copied as Markdown" : "Couldn't copy");

  return (
    <div className="page page-narrow">
      <Link to="/notes" className="back-link">
        <Icon name="back" size={16} /> All notes
      </Link>

      <article className={`card note-sheet ${tinted ? "tinted" : ""}`} style={tinted ? { background: note.color } : undefined}>
        <div className="note-card-top">
          <span className="pill">{note.category}</span>
          {note.pinned && (
            <span className="pinned-flag">
              <Icon name="pin" size={13} /> Pinned
            </span>
          )}
        </div>

        <h1 className="sheet-title">{note.title}</h1>
        <p className="sheet-meta">
          Created {formatDate(note.createdAt)} · Edited {timeAgo(note.updatedAt)} · {wordCount(note.content)} words
        </p>

        <Markdown className="md-doc">{note.content}</Markdown>
      </article>

      <div className="action-row">
        <button className="btn btn-primary" onClick={() => navigate(`/notes/${note.id}/edit`)}>
          <Icon name="edit" size={16} /> Edit
        </button>
        <button className="btn btn-ghost" onClick={pin}>
          <Icon name="pin" size={16} /> {note.pinned ? "Unpin" : "Pin"}
        </button>
        <button className="btn btn-ghost" onClick={copy}>
          <Icon name="copy" size={16} /> Copy
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => downloadText(`${slugify(note.title)}.md`, `# ${note.title}\n\n${note.content}\n`)}
        >
          <Icon name="download" size={16} /> Export .md
        </button>
        <button className="btn btn-ghost btn-danger-text push-right" onClick={remove}>
          <Icon name="trash" size={16} /> Delete
        </button>
      </div>
    </div>
  );
}
