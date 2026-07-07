import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function CreateNote() {

    const navigate = useNavigate();

    const [note, setNote] = useState({
        title: "",
        content: ""
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

    console.log(error.response);

    alert(
        JSON.stringify(error.response?.data || error.message)
    );

}
    };


    return (
        <div>

            <Navbar />

            <h2>Create Note</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={note.title}
                    onChange={handleChange}
                />

                <br />

                <textarea
                    name="content"
                    placeholder="Content"
                    value={note.content}
                    onChange={handleChange}
                />

                <br />

                <button type="submit">
                    Save Note
                </button>

            </form>

        </div>
    );
}

export default CreateNote;