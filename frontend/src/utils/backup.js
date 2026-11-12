import { createNote } from "../api/notes";
import { downloadText } from "./files";

export function exportNotes(notes) {
  const payload = { app: "KnowledgeCanvas", exportedAt: new Date().toISOString(), notes };
  downloadText(`knowledgecanvas-notes-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), "application/json");
}

/** Reads a backup file and re-creates each note. Returns { imported, failed }. */
export async function importNotes(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error("That file isn't a valid backup.");
  }
  const list = Array.isArray(data) ? data : data.notes;
  if (!Array.isArray(list)) throw new Error("No notes found in that file.");
  let imported = 0;
  let failed = 0;
  for (const n of list) {
    if (!n?.title || !n?.content) { failed++; continue; }
    try {
      await createNote({ title: String(n.title).slice(0, 100), content: n.content, color: n.color, category: n.category, pinned: !!n.pinned });
      imported++;
    } catch {
      failed++;
    }
  }
  return { imported, failed };
}
