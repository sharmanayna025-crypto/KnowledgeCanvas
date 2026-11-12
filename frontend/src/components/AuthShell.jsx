import Brand from "./Brand";
import Icon from "./Icon";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <section className="auth-side">
        <Brand />
        <div className="auth-pitch">
          <h1>Everything you learn, in one place.</h1>
          <ul>
            <li>
              <Icon name="note" /> Write notes in Markdown and keep them organised.
            </li>
            <li>
              <Icon name="docs" /> Turn any PDF into a summary, study notes and a quiz.
            </li>
            <li>
              <Icon name="chat" /> Ask questions and get answers straight from your documents.
            </li>
          </ul>
        </div>
        <small className="auth-credit">Built by Nayna Sharma</small>
      </section>

      <section className="auth-main">
        <div className="auth-card">
          <div className="auth-mobile-brand">
            <Brand />
          </div>
          <h2>{title}</h2>
          <p className="auth-sub">{subtitle}</p>
          {children}
          <p className="auth-foot">{footer}</p>
        </div>
      </section>
    </div>
  );
}
