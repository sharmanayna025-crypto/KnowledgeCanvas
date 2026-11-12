import { Link } from "react-router-dom";
import { excerpt, timeAgo } from "../utils/format";
import { isPlain } from "../utils/constants";
import Highlight from "./Highlight";
import Icon from "./Icon";

export default function NoteCard({ note, onPin, onDelete, onEdit, query = "", list = false }) {
  const tinted = !isPlain(note.color);

  return (
    <article
      className={`card note-card ${tinted ? "tinted" : ""} ${list ? "note-card-list" : ""}`}
      style={tinted ? { background: note.color } : undefined}
    >
      <div className="note-card-top">
        <span className="pill">{note.category}</span>
        {note.pinned && (
          <span className="pinned-flag" title="Pinned">
            <Icon name="pin" size={13} /> Pinned
          </span>
        )}
      </div>

      <h3 className="note-title">
        <Link to={`/notes/${note.id}`} className="card-link">
          <Highlight text={note.title} query={query} />
        </Link>
      </h3>

      <p className="note-excerpt">
        <Highlight text={excerpt(note.content, list ? 220 : 150)} query={query} />
      </p>

      <footer className="note-card-foot">
        <time dateTime={note.updatedAt}>Edited {timeAgo(note.updatedAt || note.createdAt)}</time>
        <div className="note-actions">
          <button
            className={`icon-btn ${note.pinned ? "is-on" : ""}`}
            onClick={() => onPin(note)}
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
            aria-pressed={!!note.pinned}
            title={note.pinned ? "Unpin" : "Pin to top"}
          >
            <Icon name="pin" size={16} />
          </button>
          <button className="icon-btn" onClick={() => onEdit(note)} aria-label="Edit note" title="Edit">
            <Icon name="edit" size={16} />
          </button>
          <button className="icon-btn" onClick={() => onDelete(note)} aria-label="Delete note" title="Delete">
            <Icon name="trash" size={16} />
          </button>
        </div>
      </footer>
    </article>
  );
}
