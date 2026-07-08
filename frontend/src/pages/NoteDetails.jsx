import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";


function NoteDetails() {

    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [note, setNote] = useState(null);


    useEffect(() => {

        fetchNote();

    }, []);



    const fetchNote = async () => {

        try {

            const response = await api.get(`/notes/${id}`);

            setNote(response.data);


        } catch(error) {

            console.log(error);

            alert("Failed to load note");

        }

    };



    const formatDate = (date) => {

        if(!date) return "";

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day:"2-digit",
                month:"short",
                year:"numeric",
                hour:"2-digit",
                minute:"2-digit"
            }
        );

    };



    if(!note) {

        return <p>Loading...</p>;

    }



    return (

        <div
            style={{
                background: theme.background,
                minHeight:"100vh",
                color:theme.text
            }}
        >

            <Navbar />


            <div
                style={{
                    padding:"40px",
                    display:"flex",
                    justifyContent:"center"
                }}
            >

                <div
                    style={{
                        width:"700px",
                        background:note.color,
                        padding:"35px",
                        borderRadius:"20px",
                        boxShadow:theme.shadow
                    }}
                >


                    <span
                        style={{
                            background:theme.primary,
                            color:"white",
                            padding:"6px 14px",
                            borderRadius:"20px"
                        }}
                    >
                        {note.category}
                    </span>



                    <h1>
                        {note.title}
                    </h1>



                    <p
                        style={{
                            whiteSpace:"pre-wrap",
                            lineHeight:"1.8",
                            fontSize:"17px"
                        }}
                    >
                        {note.content}
                    </p>



                    <hr />



                    <p>
                        Created:
                        {" "}
                        {formatDate(note.createdAt)}
                    </p>


                    <p>
                        Updated:
                        {" "}
                        {formatDate(note.updatedAt)}
                    </p>



                    <button
                        onClick={() =>
                            navigate(`/edit/${note.id}`)
                        }
                    >
                        Edit
                    </button>


                    <button
                        style={{
                            marginLeft:"10px"
                        }}
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Back
                    </button>


                </div>


            </div>


        </div>

    );

}


export default NoteDetails;