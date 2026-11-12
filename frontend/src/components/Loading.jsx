export function Spinner({ label = "Loading" }) {
  return <span className="spinner" role="status" aria-label={label} />;
}

export function PageLoading({ label = "Loading…" }) {
  return (
    <div className="page-loading">
      <Spinner label={label} />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonCards({ count = 6 }) {
  return (
    <div className="grid-cards" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card skeleton-card">
          <div className="skeleton" style={{ width: "40%", height: 14 }} />
          <div className="skeleton" style={{ width: "80%", height: 20, marginTop: 14 }} />
          <div className="skeleton" style={{ width: "100%", height: 12, marginTop: 14 }} />
          <div className="skeleton" style={{ width: "70%", height: 12, marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}
