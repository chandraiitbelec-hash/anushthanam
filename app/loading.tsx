// Route-level loading UI shown during navigation / streaming. Server component,
// language-agnostic (no text), theme-aware via CSS vars.
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <span className="anu-spinner" />
      <style>{`
        .anu-spinner {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-gold);
          animation: anu-spin 0.8s linear infinite;
        }
        @keyframes anu-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .anu-spinner { animation-duration: 2s; }
        }
      `}</style>
    </div>
  );
}
