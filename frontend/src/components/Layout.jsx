import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Brand from "./Brand";
import Icon from "./Icon";

const NAV = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/notes", label: "Notes", icon: "note" },
  { to: "/documents", label: "Documents", icon: "docs" },
  { to: "/search", label: "Search", icon: "search" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Press "/" anywhere to jump to search.
  useEffect(() => {
    const onKey = (e) => {
      const el = document.activeElement;
      const typing = el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        navigate("/search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initial = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="shell">
      <aside className="sidebar">
        <NavLink to="/" className="sidebar-brand" aria-label="KnowledgeCanvas home">
          <Brand />
        </NavLink>

        <button className="btn btn-primary sidebar-cta" onClick={() => navigate("/notes/new")}>
          <Icon name="plus" size={16} /> New note
        </button>

        <nav className="nav" aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="profile">
            <span className="avatar" aria-hidden="true">{initial}</span>
            <span className="profile-text">
              <strong>{user?.name || "Signed in"}</strong>
              <small>{user?.email}</small>
            </span>
          </div>
          <div className="sidebar-actions">
            <button
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              title={isDark ? "Light theme" : "Dark theme"}
            >
              <Icon name={isDark ? "sun" : "moon"} />
            </button>
            <button className="icon-btn" onClick={handleLogout} aria-label="Sign out" title="Sign out">
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </aside>

      <header className="topbar">
        <Brand />
        <div className="sidebar-actions">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            <Icon name={isDark ? "sun" : "moon"} />
          </button>
          <button className="icon-btn" onClick={handleLogout} aria-label="Sign out">
            <Icon name="logout" />
          </button>
        </div>
      </header>

      <main className="main" id="main">
        <Outlet />
      </main>
    </div>
  );
}
