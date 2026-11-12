const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps every match of `query` in <mark>, like a highlighter pen. */
export default function Highlight({ text = "", query = "" }) {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escape(q)})`, "ig"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? <mark key={i}>{part}</mark> : part
  );
}
