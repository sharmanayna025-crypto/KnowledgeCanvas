import { Link } from "react-router-dom";
import { formatBytes, formatDate, plural } from "../utils/format";
import Icon from "./Icon";

export default function DocCard({ doc, onDelete }) {
  return (
    <article className="card doc-card">
      <div className="doc-card-top">
        <span className="doc-icon">
          <Icon name="file" size={20} />
        </span>
        <button
          className="icon-btn"
          onClick={() => onDelete(doc)}
          aria-label={`Delete ${doc.original_filename}`}
          title="Delete"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>

      <h3 className="doc-title">
        <Link to={`/documents/${doc.id}`} className="card-link">
          {doc.original_filename}
        </Link>
      </h3>

      <p className="doc-meta">
        {plural(doc.page_count, "page")} · {formatBytes(doc.size_bytes)} · {formatDate(doc.created_at)}
      </p>

      <p className="doc-preview">{doc.preview}</p>

      <div className="badges">
        <span className={`badge ${doc.has_summary ? "on" : ""}`}>Summary</span>
        <span className={`badge ${doc.has_notes ? "on" : ""}`}>Notes</span>
        <span className={`badge ${doc.has_quiz ? "on" : ""}`}>Quiz</span>
        <span className={`badge ${doc.has_flashcards ? "on" : ""}`}>Cards</span>
      </div>
    </article>
  );
}
