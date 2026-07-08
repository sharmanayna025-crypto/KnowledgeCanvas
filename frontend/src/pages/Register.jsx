import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useTheme } from "../context/ThemeContext";

function Register() {

    const navigate = useNavigate();
    const { theme } = useTheme();

    const [formData, setFormData] = useState({
        name: "",
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

            await api.post("/auth/register", formData);

            alert("Registration successful");

            navigate("/login");

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.message ||
                "Registration failed"
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
                    width: "420px",
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
                        marginBottom: "10px"
                    }}
                >
                    📚 KnowledgeCanvas
                </h1>

                <h2
                    style={{
                        textAlign: "center",
                        marginBottom: "30px"
                    }}
                >
                    Create Account
                </h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
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
                        Create Account
                    </button>

                </form>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "20px"
                    }}
                >
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        style={{
                            color: theme.primary,
                            textDecoration: "none",
                            fontWeight: "bold"
                        }}
                    >
                        Login
                    </Link>
                </p>

            </div>

        </div>

    );

}

export default Register;