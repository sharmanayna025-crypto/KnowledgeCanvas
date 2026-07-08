import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import { useTheme } from "../context/ThemeContext";

function Dashboard() {

    const { theme } = useTheme();

    const [notes, setNotes] = useState([]);
    const [allNotes, setAllNotes] = useState([]);

    const [keyword, setKeyword] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("Newest");

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {

        try {

            const response = await api.get("/notes");

            setAllNotes(response.data);

            applyFilters(
                response.data,
                keyword,
                selectedCategory,
                sortBy
            );

        } catch (error) {

            console.log(error);

        }

    };

    const applyFilters = (
        noteList,
        search,
        category,
        sorting
    ) => {

        let filtered = [...noteList];

        if (search.trim() !== "") {

            filtered = filtered.filter(note =>
                note.title.toLowerCase().includes(search.toLowerCase())
            );

        }

        if (category !== "All") {

            filtered = filtered.filter(
                note => note.category === category
            );

        }

        switch (sorting) {

            case "Newest":

                filtered.sort(
                    (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                );

                break;

            case "Oldest":

                filtered.sort(
                    (a, b) =>
                        new Date(a.createdAt) -
                        new Date(b.createdAt)
                );

                break;

            case "A-Z":

                filtered.sort(
                    (a, b) =>
                        a.title.localeCompare(b.title)
                );

                break;

            case "Z-A":

                filtered.sort(
                    (a, b) =>
                        b.title.localeCompare(a.title)
                );

                break;

            default:
                break;

        }

        setNotes(filtered);

    };

    const handleSearch = () => {

        applyFilters(
            allNotes,
            keyword,
            selectedCategory,
            sortBy
        );

    };

    return (

        <div
            style={{
                background: theme.background,
                color: theme.text,
                minHeight: "100vh"
            }}
        >

            <Navbar />

            <div
                style={{
                    padding: "30px"
                }}
            >

                <h2>Your Notes</h2>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginBottom: "30px"
                    }}
                >

                    <input
                        type="text"
                        placeholder="Search..."
                        value={keyword}
                        onChange={(e) =>
                            setKeyword(e.target.value)
                        }
                        onKeyDown={(e) => {

                            if (e.key === "Enter") {

                                handleSearch();

                            }

                        }}
                    />

                    <button
                        onClick={handleSearch}
                    >
                        Search
                    </button>

                    <select
                        value={selectedCategory}
                        onChange={(e) => {

                            setSelectedCategory(e.target.value);

                            applyFilters(
                                allNotes,
                                keyword,
                                e.target.value,
                                sortBy
                            );

                        }}
                    >

                        <option>All</option>
                        <option>General</option>
                        <option>Study</option>
                        <option>Work</option>
                        <option>Personal</option>
                        <option>Ideas</option>
                        <option>To-Do</option>

                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => {

                            setSortBy(e.target.value);

                            applyFilters(
                                allNotes,
                                keyword,
                                selectedCategory,
                                e.target.value
                            );

                        }}
                    >

                        <option>Newest</option>

                        <option>Oldest</option>

                        <option>A-Z</option>

                        <option>Z-A</option>

                    </select>

                    <button
                        onClick={() => {

                            setKeyword("");

                            setSelectedCategory("All");

                            setSortBy("Newest");

                            fetchNotes();

                        }}
                    >
                        Reset
                    </button>

                </div>

                {
                    notes.length === 0 ?

                        (

                            <h3>No Notes Found</h3>

                        )

                        :

                        (

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fill,minmax(300px,1fr))",
                                    gap: "20px"
                                }}
                            >

                                {
                                    notes.map(note => (

                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                        />

                                    ))
                                }

                            </div>

                        )
                }

            </div>

        </div>

    );

}

export default Dashboard;