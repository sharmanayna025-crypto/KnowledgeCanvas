import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { PageLoading } from "./components/Loading";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Documents from "./pages/Documents";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Notes from "./pages/Notes";
import Register from "./pages/Register";
import Search from "./pages/Search";

// Pages that render Markdown pull in a large parser, so load them on demand.
const DocumentWorkspace = lazy(() => import("./pages/DocumentWorkspace"));
const NoteDetails = lazy(() => import("./pages/NoteDetails"));
const NoteEditor = lazy(() => import("./pages/NoteEditor"));

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="notes" element={<Notes />} />
        <Route path="notes/new" element={<NoteEditor />} />
        <Route path="notes/:id" element={<NoteDetails />} />
        <Route path="notes/:id/edit" element={<NoteEditor />} />
        <Route path="documents" element={<Documents />} />
        <Route path="documents/:id" element={<DocumentWorkspace />} />
        <Route path="search" element={<Search />} />

        {/* Old KnowledgeCanvas URLs */}
        <Route path="dashboard" element={<Navigate to="/notes" replace />} />
        <Route path="create" element={<Navigate to="/notes/new" replace />} />
        <Route path="edit/:id" element={<LegacyEdit />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </Suspense>
  );
}

function LegacyEdit() {
  const { id } = useParams();
  return <Navigate to={`/notes/${id}/edit`} replace />;
}
