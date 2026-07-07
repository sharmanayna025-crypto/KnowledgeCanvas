import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function EditNote() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [note, setNote] = useState({
        title: "",
        content: "",
        color: "white"
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

            alert("Failed to update note");

        }
    };


    return (
        <div>

            <Navbar />


            <div
                style={{
                    padding: "30px",
                    maxWidth: "600px",
                    margin: "auto"
                }}
            >

                <h2>Edit Note</h2>


                <form onSubmit={handleSubmit}>


                    <input
                        type="text"
                        name="title"
                        value={note.title}
                        onChange={handleChange}
                    />


                    <br /><br />


                    <textarea
                        name="content"
                        rows="8"
                        value={note.content}
                        onChange={handleChange}
                    />


                    <br /><br />


                    <label>
                        Choose Note Color:
                    </label>


                    <br />


                    <select
                        name="color"
                        value={note.color || "white"}
                        onChange={handleChange}
                    >

                        <option value="white">
                            White
                        </option>

                        <option value="#fff9c4">
                            Yellow
                        </option>

                        <option value="#bbdefb">
                            Blue
                        </option>

                        <option value="#c8e6c9">
                            Green
                        </option>

                        <option value="#f8bbd0">
                            Pink
                        </option>

                        <option value="#e1bee7">
                            Purple
                        </option>

                    </select>


                    <br /><br />


                    <button
                        type="submit"
                        style={{
                            background: "#2563eb",
                            color: "white"
                        }}
                    >
                        Update Note
                    </button>


                </form>

            </div>

        </div>
    );
}

export default EditNote;