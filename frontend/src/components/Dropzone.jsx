import { useRef, useState } from "react";
import Icon from "./Icon";

export default function Dropzone({ onFiles, busy, maxMb = 25 }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);

  const pick = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length) onFiles(files);
    if (input.current) input.current.value = "";
  };

  return (
    <div
      className={`dropzone ${over ? "over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        pick(e.dataTransfer.files);
      }}
    >
      <span className="empty-icon">
        <Icon name="upload" size={24} />
      </span>
      <div>
        <strong>{over ? "Drop to upload" : "Drop PDFs here"}</strong>
        <p>
          or choose files from your computer. Up to {maxMb} MB each, text-based PDFs work best.
        </p>
      </div>
      <button className="btn btn-primary" onClick={() => input.current?.click()} disabled={busy}>
        Choose PDFs
      </button>
      <input
        ref={input}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        hidden
        onChange={(e) => pick(e.target.files)}
      />
    </div>
  );
}
