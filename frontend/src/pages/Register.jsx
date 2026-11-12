import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { errorMessage } from "../api/http";
import AuthShell from "../components/AuthShell";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Register() {
  useDocumentTitle("Create account");
  const { register, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Use at least 6 characters for your password.");
      return;
    }
    setBusy(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success(`Welcome, ${form.name.trim().split(" ")[0]}. Your canvas is ready.`);
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't create your account.", "notes server"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes a few seconds. No card, no catch."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form onSubmit={submit} className="stack" noValidate>
        <label className="field">
          <span>Your name</span>
          <input
            className="input"
            name="name"
            autoComplete="name"
            autoFocus
            required
            value={form.name}
            onChange={update}
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            className="input"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={update}
          />
        </label>
        <PasswordField
          name="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={form.password}
          onChange={update}
        />
        <small className="hint">At least 6 characters.</small>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="btn btn-primary btn-block"
          disabled={busy || !form.name || !form.email || !form.password}
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
