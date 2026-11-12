import { useMemo, useState } from "react";
import { deleteDocument, listDocuments, uploadDocument } from "../api/documents";
import { errorMessage } from "../api/http";
import DocCard from "../components/DocCard";
import Dropzone from "../components/Dropzone";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import { SkeletonCards } from "../components/Loading";
import ServiceBanner from "../components/ServiceBanner";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";
import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { plural } from "../utils/format";

const MAX_MB = 25;

export default function Documents() {
  useDocumentTitle("Documents");
  const toast = useToast();
  const confirm = useConfirm();
  const { data, loading, error, reload, setData } = useAsync(listDocuments, []);
  const docs = data || [];

  const [uploads, setUploads] = useState([]); // { key, name, progress, status, message }
  const [filter, setFilter] = useState("");

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? docs.filter((d) => d.original_filename.toLowerCase().includes(q)) : docs;
  }, [docs, filter]);

  const patchUpload = (key, patch) =>
    setUploads((list) => list.map((u) => (u.key === key ? { ...u, ...patch } : u)));

  const handleFiles = async (files) => {
    const entries = files.map((file, i) => ({
      key: `${Date.now()}-${i}`,
      file,
      name: file.name,
      progress: 0,
      status: "waiting",
    }));
    setUploads((list) => [...entries.map(({ file: _f, ...rest }) => rest), ...list].slice(0, 6));

    for (const entry of entries) {
      const { file, key } = entry;
      if (!/\.pdf$/i.test(file.name)) {
        patchUpload(key, { status: "error", message: "Only PDF files are supported." });
        continue;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        patchUpload(key, { status: "error", message: `Larger than ${MAX_MB} MB.` });
        continue;
      }
      patchUpload(key, { status: "uploading" });
      try {
        const result = await uploadDocument(file, (progress) => patchUpload(key, { progress }));
        patchUpload(key, { status: "done", progress: 100 });
        setData((list) => [result.document, ...(list || [])]);
        // Clear finished rows after a moment so the list stays tidy.
        setTimeout(() => setUploads((list) => list.filter((u) => u.key !== key)), 4000);
      } catch (e) {
        patchUpload(key, {
          status: "error",
          message: errorMessage(e, "Upload failed.", "document service"),
        });
      }
    }
  };

  const remove = async (doc) => {
    const ok = await confirm({
      title: `Delete “${doc.original_filename}”?`,
      body: "The PDF, its summary, notes, quiz and chat will be removed for good.",
      confirmLabel: "Delete document",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteDocument(doc.id);
      setData((list) => list.filter((d) => d.id !== doc.id));
      toast.success("Document deleted");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't delete that document."));
    }
  };

  const busy = uploads.some((u) => u.status === "uploading" || u.status === "waiting");

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-sub">
            {loading && !data ? "Loading…" : docs.length ? plural(docs.length, "PDF") : "Upload a PDF to study it faster."}
          </p>
        </div>
      </header>

      <ServiceBanner
        error={error}
        service="document service"
        hint="cd ai-service && uvicorn app.main:app --reload"
        onRetry={reload}
      />

      <Dropzone onFiles={handleFiles} busy={busy} maxMb={MAX_MB} />

      {uploads.length > 0 && (
        <ul className="uploads" aria-live="polite">
          {uploads.map((u) => (
            <li key={u.key} className={`upload-row ${u.status}`}>
              <Icon name={u.status === "error" ? "x" : u.status === "done" ? "check" : "file"} size={16} />
              <span className="upload-name">{u.name}</span>
              {u.status === "uploading" && (
                <>
                  <span className="progress">
                    <span style={{ width: `${u.progress}%` }} />
                  </span>
                  <small>{u.progress < 100 ? `${u.progress}%` : "Reading text…"}</small>
                </>
              )}
              {u.status === "waiting" && <small>Waiting</small>}
              {u.status === "done" && <small>Added</small>}
              {u.status === "error" && <small className="upload-error">{u.message}</small>}
            </li>
          ))}
        </ul>
      )}

      {docs.length > 4 && (
        <div className="toolbar">
          <label className="search-field">
            <Icon name="search" size={16} />
            <input
              className="input"
              type="search"
              placeholder="Filter by file name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter documents"
            />
          </label>
        </div>
      )}

      {loading && !data ? (
        <SkeletonCards count={3} />
      ) : docs.length === 0 && !error ? (
        <EmptyState icon="docs" title="No documents yet">
          Once you upload a PDF you can summarise it, turn it into study notes, take a quiz and chat with it.
        </EmptyState>
      ) : visible.length === 0 && docs.length > 0 ? (
        <EmptyState icon="search" title="No files match that name" />
      ) : (
        <div className="grid-cards section">
          {visible.map((d) => (
            <DocCard key={d.id} doc={d} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
}
