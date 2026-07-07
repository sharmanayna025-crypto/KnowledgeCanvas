import { useEffect, useState } from "react";
import api from "../api/axios";
import NoteCard from "../components/NoteCard";
import Navbar from "../components/Navbar";

function Dashboard() {

    const [notes, setNotes] = useState([]);
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {

        try {

            const response = await api.get("/notes");

            setNotes(response.data);

        } catch (error) {

            console.log(error);

        }
    };

    const handleSearch = async () => {

        if (keyword.trim() === "") {
            fetchNotes();
            return;
        }

        try {

            const response = await api.get(
                `/notes/search?keyword=${keyword}`
            );

            setNotes(response.data);

        } catch (error) {

            console.log(error);

        }
    };

    return (
        <div>

            <Navbar />

            <h2>Your Notes</h2>

            <input
                type="text"
                placeholder="Search notes..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
            />

            <button onClick={handleSearch}>
                Search
            </button>

            <button
                onClick={() => {
                    setKeyword("");
                    fetchNotes();
                }}
            >
                Clear
            </button>

            <br /><br />

            {
                notes.length === 0 ? (
                    <p>No notes found</p>
                ) : (
                    notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                        />
                    ))
                )
            }

        </div>
    );
}

export default Dashboard;