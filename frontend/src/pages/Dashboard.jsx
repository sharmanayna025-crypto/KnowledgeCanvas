import { useEffect, useState } from "react";
import api from "../api/axios";
import NoteCard from "../components/NoteCard";

function Dashboard() {

    const [notes, setNotes] = useState([]);


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


    return (
        <div>

            <h2>Your Notes</h2>

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