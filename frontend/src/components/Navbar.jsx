import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {

    const { token } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/login");

    };


    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 30px",
                background: "#ffffff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
        >

            <h2
                style={{
                    margin: 0
                }}
            >
                KnowledgeCanvas
            </h2>


            <div>

                <Link
                    to="/dashboard"
                    style={{
                        marginRight: "20px",
                        textDecoration: "none"
                    }}
                >
                    Dashboard
                </Link>


                <Link
                    to="/create"
                    style={{
                        marginRight: "20px",
                        textDecoration: "none"
                    }}
                >
                    Create Note
                </Link>


                {
                    token && (
                        <button
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    )
                }

            </div>

        </nav>
    );
}

export default Navbar;