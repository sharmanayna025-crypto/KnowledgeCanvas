import { useState } from "react";
import Icon from "./Icon";

export default function PasswordField({ label = "Password", ...props }) {
  const [show, setShow] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <span className="input-wrap">
        <input className="input" type={show ? "text" : "password"} {...props} />
        <button
          type="button"
          className="input-toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
        >
          <Icon name="eye" size={17} />
        </button>
      </span>
    </label>
  );
}
