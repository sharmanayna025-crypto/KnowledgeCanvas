import { useEffect, useRef, useState } from "react";
import { askQuestion, clearChat, getChatHistory } from "../api/documents";
import { errorMessage } from "../api/http";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";
import Icon from "./Icon";
import Markdown from "./Markdown";

const SUGGESTIONS = [
  "What are the main ideas in this document?",
  "Explain the hardest concept as simply as you can.",
  "List the key terms and what they mean.",
];

export default function ChatPanel({ documentId, onSaveAnswer }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getChatHistory(documentId)
      .then((h) => !cancelled && setMessages(h))
      .catch(() => {})
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const send = async (text) => {
    const question = text.trim();
    if (!question || sending) return;
    setDraft("");
    setSending(true);
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", content: question }]);
    try {
      const answer = await askQuestion(documentId, question);
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: "assistant", content: answer }]);
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't get an answer.", "document service"));
      setMessages((m) => m.slice(0, -1));
      setDraft(question);
    } finally {
      setSending(false);
    }
  };

  const clear = async () => {
    const ok = await confirm({
      title: "Clear this conversation?",
      body: "The document and its summary, notes and quiz stay as they are.",
      confirmLabel: "Clear chat",
      danger: true,
    });
    if (!ok) return;
    try {
      await clearChat(documentId);
      setMessages([]);
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't clear the chat."));
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(draft);
    }
  };

  return (
    <div className="chat">
      <div className="chat-log" aria-live="polite">
        {loaded && messages.length === 0 && (
          <div className="chat-empty">
            <h3>Ask this document anything</h3>
            <p>Answers come only from the PDF, so you can trust where they're from.</p>
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chip" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`bubble bubble-${m.role}`}>
            {m.role === "assistant" ? <Markdown>{m.content}</Markdown> : <p>{m.content}</p>}
            {m.role === "assistant" && (
              <button className="bubble-save" onClick={() => onSaveAnswer(m.content)}>
                <Icon name="note" size={14} /> Save to notes
              </button>
            )}
          </div>
        ))}

        {sending && (
          <div className="bubble bubble-assistant typing" aria-label="Thinking">
            <span /> <span /> <span />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-compose">
        <textarea
          className="textarea"
          rows={1}
          placeholder="Ask a question… (Enter to send, Shift+Enter for a new line)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Your question"
        />
        <button className="btn btn-primary" onClick={() => send(draft)} disabled={sending || !draft.trim()}>
          <Icon name="send" size={16} /> Ask
        </button>
        {messages.length > 0 && (
          <button className="icon-btn" onClick={clear} aria-label="Clear conversation" title="Clear conversation">
            <Icon name="trash" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
