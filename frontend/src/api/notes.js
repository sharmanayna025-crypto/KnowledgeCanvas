import { core } from "./http";

export const listNotes = () => core.get("/notes").then((r) => r.data);
export const getNote = (id) => core.get(`/notes/${id}`).then((r) => r.data);
export const createNote = (note) => core.post("/notes", note).then((r) => r.data);
export const updateNote = (id, note) => core.put(`/notes/${id}`, note).then((r) => r.data);
export const deleteNote = (id) => core.delete(`/notes/${id}`);
export const togglePin = (id) => core.patch(`/notes/${id}/pin`).then((r) => r.data);
