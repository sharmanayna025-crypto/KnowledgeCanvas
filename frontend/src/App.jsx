import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateNote from "./pages/CreateNote";
import EditNote from "./pages/EditNote";
import NoteDetails from "./pages/NoteDetails";

import ProtectedRoute from "./components/ProtectedRoute";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/create"
                    element={
                        <ProtectedRoute>
                            <CreateNote />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditNote />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/notes/:id"
                    element={
                        <ProtectedRoute>
                            <NoteDetails />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;