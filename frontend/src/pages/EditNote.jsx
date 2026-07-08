import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

function EditNote() {

    const { id } = useParams();
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

    useEffect(() => {
        fetchNote();
    }, []);

    const fetchNote = async () => {

        try {

            const response = await api.get(`/notes/${id}`);

            setNote(response.data);

        } catch (error) {

            console.log(error);

            alert("Failed to load note");

        }

    };

    const handleChange = (e) => {

        setNote({
            ...note,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await api.put(`/notes/${id}`, note);

            alert("Note updated successfully");

            navigate("/dashboard");

        } catch (error) {

    console.log(error);
    console.log(error.response);
    console.log(error.response?.data);

    alert(
        JSON.stringify(error.response?.data, null, 2)
    );

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
                        padding: "35px",
                        borderRadius: "20px",
                        boxShadow: theme.shadow,
                        border: `1px solid ${theme.border}`
                    }}
                >

                    <h2
                        style={{
                            color: theme.primary,
                            marginTop: 0
                        }}
                    >
                        Edit Note
                    </h2>

                    <input
                        type="text"
                        name="title"
                        value={note.title}
                        onChange={handleChange}
                        style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: "10px",
                            border: `1px solid ${theme.border}`,
                            background: theme.background,
                            color: theme.text,
                            marginBottom: "20px",
                            boxSizing: "border-box"
                        }}
                    />

                    <textarea
                        name="content"
                        rows="10"
                        value={note.content}
                        onChange={handleChange}
                        style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: "10px",
                            border: `1px solid ${theme.border}`,
                            background: theme.background,
                            color: theme.text,
                            resize: "vertical",
                            marginBottom: "20px",
                            boxSizing: "border-box"
                        }}
                    />

                    <h4>Category</h4>

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
                            marginBottom: "25px"
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

                    <h4>Choose Color</h4>

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            flexWrap: "wrap",
                            marginBottom: "30px"
                        }}
                    >
                        {
                            colors.map((color) => (

                                <div
                                    key={color}
                                    onClick={() =>
                                        setNote({
                                            ...note,
                                            color
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
                        onClick={handleSubmit}
                        style={{
                            width: "100%",
                            padding: "15px",
                            border: "none",
                            borderRadius: "10px",
                            background: theme.primary,
                            color: "white",
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: "16px"
                        }}
                    >
                        Update Note
                    </button>

                </div>

            </div>

        </div>

    );
}

export default EditNote;