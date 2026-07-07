import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function NoteCard({ note }) {

    const navigate = useNavigate();

    const handleDelete = async () => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this note?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await api.delete(`/notes/${note.id}`);

            alert("Note deleted successfully");

            window.location.reload();

        } catch (error) {

            console.log(error);

            alert("Failed to delete note");

        }
    };


    return (
        <div
            style={{
                background: note.color || "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                marginBottom: "20px",
                maxWidth: "600px"
            }}
        >

            <h3
                style={{
                    marginTop: 0,
                    color: "#222"
                }}
            >
                {note.title}
            </h3>


            <p
                style={{
                    color: "#555",
                    lineHeight: "1.6"
                }}
            >
                {note.content}
            </p>


            <div
                style={{
                    marginTop: "15px"
                }}
            >

                <button
                    onClick={() => navigate(`/edit/${note.id}`)}
                    style={{
                        background: "#2563eb",
                        color: "white",
                        marginRight: "10px"
                    }}
                >
                    Edit
                </button>


                <button
                    onClick={handleDelete}
                    style={{
                        background: "#dc2626",
                        color: "white"
                    }}
                >
                    Delete
                </button>

            </div>

        </div>
    );
}

export default NoteCard;