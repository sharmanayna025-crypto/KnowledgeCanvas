import { ai } from "./http";

export const listDocuments = () => ai.get("/documents").then((r) => r.data);
export const getDocument = (id) => ai.get(`/documents/${id}`).then((r) => r.data);
export const deleteDocument = (id) => ai.delete(`/documents/${id}`).then((r) => r.data);
export const searchDocuments = (query) =>
  ai.get("/search", { params: { query } }).then((r) => r.data);

export const uploadDocument = (file, onProgress) => {
  const form = new FormData();
  form.append("file", file);
  return ai
    .post("/upload", form, {
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
    })
    .then((r) => r.data);
};

export const fetchPdfBlob = (id) =>
  ai.get(`/documents/${id}/file`, { responseType: "blob" }).then((r) => r.data);

export const getSummary = (id, regenerate = false) =>
  ai.get(`/summary/${id}`, { params: { regenerate } }).then((r) => r.data.summary);
export const getNotes = (id, regenerate = false) =>
  ai.get(`/notes/${id}`, { params: { regenerate } }).then((r) => r.data.notes);
export const getQuiz = (id, regenerate = false) =>
  ai.get(`/quiz/${id}`, { params: { regenerate } }).then((r) => r.data.quiz);

export const askQuestion = (id, question) =>
  ai.post(`/chat/${id}`, { question }).then((r) => r.data.answer);
export const getChatHistory = (id) => ai.get(`/chat/${id}/history`).then((r) => r.data);
export const clearChat = (id) => ai.delete(`/chat/${id}/history`).then((r) => r.data);

export const getFlashcards = (id, regenerate = false) =>
  ai.get(`/flashcards/${id}`, { params: { regenerate } }).then((r) => r.data.flashcards);

export const assistText = (text, action) =>
  ai.post("/assist", { text, action }).then((r) => r.data.result);
