import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

function CreateNote() {

    const navigate = useNavigate();
    const { theme } = useTheme();

    const colors = [
        "#FFFFFF",
        "#FFF9C4",
        "#FFCDD2",
        "#C8E6C9",
        "#BBDEFB",
        "#E1BEE7",
        "#FFE0B2",
        "#D7CCC8"
    ];

    const categories = [
        "General",
        "Study",
        "Work",
        "Personal",
        "Ideas",
        "To-Do"
    ];

    const [note, setNote] = useState({
        title: "",
        content: "",
        color: "#FFFFFF",
        category: "General"
    });

    const handleChange = (e) => {

        setNote({
            ...note,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await api.post("/notes", note);

            alert("Note created successfully");

            navigate("/dashboard");

        } catch (error) {

            console.log(error);

            alert("Failed to create note");

        }
    };

    return (

        <div
            style={{
                background: theme.background,
                minHeight: "100vh",
                color: theme.text
            }}
        >

            <Navbar />

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "40px"
                }}
            >

                <div
                    style={{
                        width: "650px",
                        background: theme.card,
                        borderRadius: "20px",
                        padding: "35px",
                        boxShadow: theme.shadow,
                        border: `1px solid ${theme.border}`
                    }}
                >

                    <h2
                        style={{
                            marginTop: 0,
                            color: theme.primary
                        }}
                    >
                        Create a New Note
                    </h2>

                    <input
                        type="text"
                        name="title"
                        placeholder="Enter title..."
                        value={note.title}
                        onChange={handleChange}
                        required
                        style={{
                            width: "100%",
                            padding: "14px",
                            marginBottom: "20px",
                            borderRadius: "10px",
                            border: `1px solid ${theme.border}`,
                            background: theme.background,
                            color: theme.text,
                            fontSize: "16px",
                            boxSizing: "border-box"
                        }}
                    />

                    <textarea
                        name="content"
                        placeholder="Write your thoughts..."
                        value={note.content}
                        onChange={handleChange}
                        required
                        rows="10"
                        style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: "10px",
                            border: `1px solid ${theme.border}`,
                            background: theme.background,
                            color: theme.text,
                            resize: "vertical",
                            fontSize: "16px",
                            boxSizing: "border-box"
                        }}
                    />

                    <h4
                        style={{
                            marginTop: "25px"
                        }}
                    >
                        Choose Category
                    </h4>

                    <select
                        name="category"
                        value={note.category}
                        onChange={handleChange}
                        style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "10px",
                            border: `1px solid ${theme.border}`,
                            background: theme.background,
                            color: theme.text,
                            marginBottom: "25px",
                            fontSize: "16px"
                        }}
                    >

                        {
                            categories.map((category) => (

                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>

                            ))
                        }

                    </select>

                    <h4>
                        Choose a Note Color
                    </h4>

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            marginBottom: "30px",
                            flexWrap: "wrap"
                        }}
                    >

                        {
                            colors.map((color) => (

                                <div
                                    key={color}
                                    onClick={() =>
                                        setNote({
                                            ...note,
                                            color: color
                                        })
                                    }
                                    style={{
                                        width: "35px",
                                        height: "35px",
                                        borderRadius: "50%",
                                        background: color,
                                        cursor: "pointer",
                                        border:
                                            note.color === color
                                                ? `3px solid ${theme.primary}`
                                                : "1px solid #ccc"
                                    }}
                                />

                            ))
                        }

                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        style={{
                            width: "100%",
                            padding: "15px",
                            background: theme.primary,
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}
                    >
                        Save Note
                    </button>

                </div>

            </div>

        </div>

    );
}

export default CreateNote;