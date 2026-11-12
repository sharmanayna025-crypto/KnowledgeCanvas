import { useEffect, useRef, useState } from "react";
import { errorMessage } from "../api/http";
import { useToast } from "../context/ToastContext";
import { copyText, downloadText } from "../utils/files";
import { slugify } from "../utils/format";
import Icon from "./Icon";
import Markdown from "./Markdown";
import FlashcardDeck from "./FlashcardDeck";
import QuizPlayer from "./QuizPlayer";

const WAITING = [
  "Reading your document…",
  "Picking out the important parts…",
  "Putting it together…",
  "Almost there…",
];

function Waiting() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => Math.min(n + 1, WAITING.length - 1)), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="ai-waiting" role="status">
      <div className="skeleton" style={{ width: "55%", height: 22 }} />
      <div className="skeleton" style={{ width: "100%", height: 12, marginTop: 18 }} />
      <div className="skeleton" style={{ width: "92%", height: 12, marginTop: 10 }} />
      <div className="skeleton" style={{ width: "96%", height: 12, marginTop: 10 }} />
      <div className="skeleton" style={{ width: "60%", height: 12, marginTop: 10 }} />
      <p>{WAITING[i]}</p>
    </div>
  );
}

/**
 * One AI output (summary, notes or quiz) for a document.
 * If the server already cached it we load it straight away; otherwise we
 * show a button so nobody spends an API call by accident.
 */
export default function AiTab({ kind, doc, fetcher, onGenerated, onSaveNote }) {
  const toast = useToast();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const autoLoaded = useRef(false);

  const labels = {
    summary: { noun: "summary", cta: "Write a summary", hint: "A short overview with the key points and takeaways." },
    notes: { noun: "study notes", cta: "Make study notes", hint: "Organised notes by topic, plus key terms." },
    quiz: { noun: "quiz", cta: "Create a quiz", hint: "Ten multiple-choice questions with explanations." },
    flashcards: { noun: "flashcards", cta: "Make flashcards", hint: "A deck of term-and-answer cards to flip through." },
  }[kind];

  const cachedOnServer = { summary: doc.has_summary, notes: doc.has_notes, quiz: doc.has_quiz, flashcards: doc.has_flashcards }[kind];

  const generate = async (regenerate = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(doc.id, regenerate);
      setContent(result);
      onGenerated?.(kind);
    } catch (e) {
      setError(errorMessage(e, `Couldn't make the ${labels.noun}.`, "document service"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cachedOnServer && !autoLoaded.current) {
      autoLoaded.current = true;
      generate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const baseName = slugify(doc.original_filename.replace(/\.pdf$/i, ""));
  const isList = kind === "quiz" || kind === "flashcards";
  const asText = isList ? null : content;

  if (loading && !content) return <Waiting />;

  if (!content) {
    return (
      <div className="ai-start">
        <span className="empty-icon">
          <Icon name={kind === "quiz" ? "quiz" : kind === "flashcards" ? "copy" : "sparkle"} size={26} />
        </span>
        <h3>{labels.cta}</h3>
        <p>{labels.hint} It's saved, so you only wait once.</p>
        {error && <p className="field-error" role="alert">{error}</p>}
        <button className="btn btn-primary" onClick={() => generate(false)}>
          <Icon name="sparkle" size={16} /> {error ? "Try again" : labels.cta}
        </button>
      </div>
    );
  }

  return (
    <div className="ai-result">
      <div className="ai-toolbar">
        {asText && (
          <>
            <button
              className="btn btn-ghost btn-sm"
              onClick={async () => toast.show((await copyText(asText)) ? "Copied to clipboard" : "Couldn't copy")}
            >
              <Icon name="copy" size={15} /> Copy
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => downloadText(`${baseName}-${kind}.md`, asText)}
            >
              <Icon name="download" size={15} /> Download .md
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => onSaveNote(kind, asText)}>
              <Icon name="note" size={15} /> Save to notes
            </button>
          </>
        )}
        {kind === "flashcards" && (
          <button className="btn btn-ghost btn-sm" onClick={() => onSaveNote("flashcards", content)}>
            <Icon name="note" size={15} /> Save to notes
          </button>
        )}
        <button className="btn btn-ghost btn-sm push-right" onClick={() => generate(true)} disabled={loading}>
          <Icon name="refresh" size={15} /> {loading ? "Rewriting…" : "Regenerate"}
        </button>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}

      {kind === "flashcards" ? (
        <FlashcardDeck key={content.length + content[0].front} cards={content} />
      ) : kind === "quiz" ? (
        <QuizPlayer
          key={JSON.stringify(content).length}
          questions={content}
          regenerating={loading}
          onRegenerate={() => generate(true)}
          onSaveMissed={(missed) => onSaveNote("quiz", missed)}
        />
      ) : (
        <Markdown className="md-doc">{content}</Markdown>
      )}
    </div>
  );
}
