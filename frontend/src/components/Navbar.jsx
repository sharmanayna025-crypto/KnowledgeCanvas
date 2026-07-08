import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Navbar() {

    const { token, logout } = useAuth();
    const { isDark, toggleTheme, theme } = useTheme();

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {

        logout();

        navigate("/login");

    };

    const linkStyle = (path) => ({
        textDecoration: "none",
        color: location.pathname === path
            ? theme.primary
            : theme.text,
        fontWeight: location.pathname === path ? "bold" : "500",
        fontSize: "16px"
    });

    return (

        <nav
            style={{
                background: theme.card,
                color: theme.text,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 40px",
                boxShadow: theme.shadow,
                position: "sticky",
                top: 0,
                zIndex: 100,
                borderBottom: `1px solid ${theme.border}`
            }}
        >

            <h2
                style={{
                    margin: 0,
                    color: theme.primary
                }}
            >
                📚 KnowledgeCanvas
            </h2>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px"
                }}
            >

                <Link
                    to="/dashboard"
                    style={linkStyle("/dashboard")}
                >
                    Dashboard
                </Link>

                <Link
                    to="/create"
                    style={linkStyle("/create")}
                >
                    New Note
                </Link>

                <button
                    onClick={toggleTheme}
                    style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        background: theme.primary,
                        color: "white",
                        fontWeight: "bold"
                    }}
                >
                    {isDark ? "☀️ Light" : "🌙 Dark"}
                </button>

                {
                    token && (

                        <button
                            onClick={handleLogout}
                            style={{
                                background: theme.danger,
                                color: "white",
                                border: "none",
                                padding: "10px 18px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "600"
                            }}
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