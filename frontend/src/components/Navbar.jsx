import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {

    const { token } = useAuth();

    return (
        <nav>
            <Link to="/dashboard">
                Dashboard
            </Link>

            {" | "}

            <Link to="/create">
                Create Note
            </Link>

            <p>
                Status: {token ? "Logged in" : "Not logged in"}
            </p>
        </nav>
    );
}

export default Navbar;