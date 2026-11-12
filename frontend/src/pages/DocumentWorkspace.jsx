import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { deleteDocument, fetchPdfBlob, getDocument, getNotes, getFlashcards, getQuiz, getSummary } from "../api/documents";
import { errorMessage } from "../api/http";
import AiTab from "../components/AiTab";
import ChatPanel from "../components/ChatPanel";
import Icon from "../components/Icon";
import { PageLoading } from "../components/Loading";
import ServiceBanner from "../components/ServiceBanner";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatBytes, formatDate, plural } from "../utils/format";

const TABS = [
  { id: "summary", label: "Summary", icon: "sparkle" },
  { id: "notes", label: "Study notes", icon: "note" },
  { id: "quiz", label: "Quiz", icon: "quiz" },
  { id: "flashcards", label: "Flashcards", icon: "copy" },
  { id: "chat", label: "Chat", icon: "chat" },
  { id: "pdf", label: "Original", icon: "file" },
];

function PdfViewer({ id, name }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;
    fetchPdfBlob(id)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch((e) => !cancelled && setError(e));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  if (error) {
    return (
      <p className="field-error">
        {errorMessage(error, "The original PDF couldn't be loaded.", "document service")}
      </p>
    );
  }
  if (!url) return <PageLoading label="Loading PDF…" />;

  return (
    <div className="pdf">
      <a className="btn btn-ghost btn-sm" href={url} target="_blank" rel="noreferrer">
        <Icon name="external" size={15} /> Open in a new tab
      </a>
      <iframe title={name} src={url} />
    </div>
  );
}

function missedToMarkdown(questions) {
  return questions
    .map((q, i) => {
      const answer = q.options["ABCD".indexOf(q.answer)];
      return `**${i + 1}. ${q.question}**\n\nAnswer: ${q.answer}. ${answer}${q.explanation ? `\n\n_${q.explanation}_` : ""}`;
    })
    .join("\n\n---\n\n");
}

export default function DocumentWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [params, setParams] = useSearchParams();

  const { data: doc, loading, error, reload, setData } = useAsync(() => getDocument(id), [id]);
  useDocumentTitle(doc?.original_filename || "Document");

  const tab = TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "summary";
  const setTab = (next) => setParams({ tab: next }, { replace: true });

  useEffect(() => {
    document.getElementById(`tab-${tab}`)?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [tab, doc]);

  if (loading && !doc) return <PageLoading label="Opening document…" />;

  if (error && !doc) {
    const missing = error.response?.status === 404;
    return (
      <div className="page">
        <Link to="/documents" className="back-link">
          <Icon name="back" size={16} /> All documents
        </Link>
        {missing ? (
          <div className="empty">
            <h3>That document isn't here</h3>
            <p>It may have been deleted.</p>
          </div>
        ) : (
          <ServiceBanner
            error={error}
            service="document service"
            hint="cd ai-service && uvicorn app.main:app --reload"
            onRetry={reload}
          />
        )}
      </div>
    );
  }

  const markGenerated = (kind) => {
    const flag = { summary: "has_summary", notes: "has_notes", quiz: "has_quiz", flashcards: "has_flashcards" }[kind];
    setData((d) => ({ ...d, [flag]: true }));
  };

  // Hand AI output to the note editor so it can be tweaked before saving.
  const saveToNotes = (kind, content) => {
    const baseTitle = doc.original_filename.replace(/\.pdf$/i, "");
    const label = { summary: "Summary", notes: "Study notes", quiz: "Quiz review", chat: "Answer", flashcards: "Flashcards" }[kind];
    navigate("/notes/new", {
      state: {
        prefill: {
          title: `${label}: ${baseTitle}`.slice(0, 100),
          content: kind === "quiz" ? missedToMarkdown(content) : kind === "flashcards" ? content.map((c) => `**${c.front}**\n\n${c.back}`).join("\n\n---\n\n") : content,
          category: "Study",
          color: "#CFE5FF",
        },
      },
    });
  };

  const remove = async () => {
    const ok = await confirm({
      title: `Delete “${doc.original_filename}”?`,
      body: "The PDF, its summary, notes, quiz and chat will be removed for good.",
      confirmLabel: "Delete document",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteDocument(doc.id);
      toast.success("Document deleted");
      navigate("/documents", { replace: true });
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't delete that document."));
    }
  };

  const fetchers = { summary: getSummary, notes: getNotes, quiz: getQuiz, flashcards: getFlashcards };

  return (
    <div className="page">
      <Link to="/documents" className="back-link">
        <Icon name="back" size={16} /> All documents
      </Link>

      <header className="page-head">
        <div>
          <h1 className="page-title doc-heading">{doc.original_filename}</h1>
          <p className="page-sub">
            {plural(doc.page_count, "page")} · {formatBytes(doc.size_bytes)} · added {formatDate(doc.created_at)}
          </p>
        </div>
        <div className="head-actions">
          <button className="btn btn-ghost btn-danger-text" onClick={remove}>
            <Icon name="trash" size={16} /> Delete
          </button>
        </div>
      </header>

      <div className="tabs" role="tablist" aria-label="Document tools">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="tab-panel"
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={16} />
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </div>

      <section id="tab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="card panel">
        {tab === "chat" ? (
          <ChatPanel documentId={doc.id} onSaveAnswer={(text) => saveToNotes("chat", text)} />
        ) : tab === "pdf" ? (
          <PdfViewer id={doc.id} name={doc.original_filename} />
        ) : (
          <AiTab
            key={`${doc.id}-${tab}`}
            kind={tab}
            doc={doc}
            fetcher={fetchers[tab]}
            onGenerated={markGenerated}
            onSaveNote={saveToNotes}
          />
        )}
      </section>
    </div>
  );
}
