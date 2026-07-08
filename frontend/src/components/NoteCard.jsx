import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useTheme } from "../context/ThemeContext";

function NoteCard({ note }) {

    const navigate = useNavigate();
    const { theme } = useTheme();

    const handleDelete = async () => {

        if (!window.confirm("Delete this note?")) {
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

    const formatDate = (date) => {

        if (!date) return "";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

    };

    return (

        <div
            style={{
                background: note.color || theme.card,
                borderRadius: "18px",
                padding: "20px",
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "280px"
            }}
        >

            <div>

                <span
                    style={{
                        background: theme.primary,
                        color: "white",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "bold"
                    }}
                >
                    {note.category}
                </span>

                <h2
                    style={{
                        marginTop: "15px",
                        marginBottom: "10px"
                    }}
                >
                    {note.title}
                </h2>

                <p
                    style={{
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.6"
                    }}
                >
                    {note.content}
                </p>

            </div>

            <div>

                <hr />

                <p
                    style={{
                        fontSize: "13px",
                        color: "#777",
                        marginBottom: "5px"
                    }}
                >
                    Created:
                    {" "}
                    {formatDate(note.createdAt)}
                </p>

                <p
                    style={{
                        fontSize: "13px",
                        color: "#777"
                    }}
                >
                    Updated:
                    {" "}
                    {formatDate(note.updatedAt)}
                </p>

                <div
                    style={{
                        marginTop: "15px"
                    }}
                >

                    <button
                        onClick={() => navigate(`/edit/${note.id}`)}
                        style={{
                            marginRight: "10px"
                        }}
                    >
                        Edit
                    </button>

                    <button
                        onClick={handleDelete}
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>

    );

}

export default NoteCard;