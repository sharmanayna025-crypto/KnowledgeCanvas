import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();
    const { theme } = useTheme();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post(
                "/auth/login",
                formData
            );

            login(response.data);

            alert("Login successful");

            navigate("/dashboard");

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.message ||
                "Login failed"
            );

        }

    };

    return (

        <div
            style={{
                background: theme.background,
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: theme.text
            }}
        >

            <div
                style={{
                    width: "400px",
                    background: theme.card,
                    padding: "35px",
                    borderRadius: "20px",
                    boxShadow: theme.shadow,
                    border: `1px solid ${theme.border}`
                }}
            >

                <h1
                    style={{
                        textAlign: "center",
                        color: theme.primary,
                        marginBottom: "30px"
                    }}
                >
                    📚 KnowledgeCanvas
                </h1>

                <h2
                    style={{
                        textAlign: "center"
                    }}
                >
                    Login
                </h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginBottom: "15px",
                            borderRadius: "8px",
                            border: `1px solid ${theme.border}`,
                            background: theme.background,
                            color: theme.text,
                            boxSizing: "border-box"
                        }}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginBottom: "20px",
                            borderRadius: "8px",
                            border: `1px solid ${theme.border}`,
                            background: theme.background,
                            color: theme.text,
                            boxSizing: "border-box"
                        }}
                    />

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "none",
                            borderRadius: "8px",
                            background: theme.primary,
                            color: "white",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}
                    >
                        Login
                    </button>

                </form>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "20px"
                    }}
                >
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        style={{
                            color: theme.primary,
                            textDecoration: "none",
                            fontWeight: "bold"
                        }}
                    >
                        Register
                    </Link>
                </p>

            </div>

        </div>

    );

}

export default Login;