export function BrandMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="currentColor" />
      <rect x="13" y="14" width="28" height="36" rx="4" fill="var(--surface)" />
      <rect x="17" y="24" width="20" height="7" rx="1.5" fill="var(--mark)" />
      <rect x="17" y="21" width="16" height="2.4" rx="1.2" fill="currentColor" opacity=".55" />
      <rect x="17" y="35" width="20" height="2.4" rx="1.2" fill="currentColor" opacity=".35" />
      <rect x="17" y="40" width="12" height="2.4" rx="1.2" fill="currentColor" opacity=".35" />
      <circle cx="45" cy="42" r="9" fill="var(--accent)" />
      <path d="M41 42l3 3 5-6" stroke="var(--accent-ink)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Brand() {
  return (
    <span className="brand">
      <BrandMark />
      <span className="brand-name">KnowledgeCanvas</span>
    </span>
  );
}
