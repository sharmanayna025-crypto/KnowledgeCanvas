import { errorMessage, isNetworkError } from "../api/http";

/** Shown when a backend can't be reached, with the command that starts it. */
export default function ServiceBanner({ error, service, hint, onRetry }) {
  if (!error) return null;
  return (
    <div className="banner banner-error" role="alert">
      <div>
        <strong>
          {isNetworkError(error) ? `The ${service} isn't responding.` : "That didn't work."}
        </strong>
        <p>{errorMessage(error, "Please try again.", service)}</p>
        {isNetworkError(error) && hint && <code>{hint}</code>}
      </div>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
