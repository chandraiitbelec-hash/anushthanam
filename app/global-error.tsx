'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'Georgia, serif',
          backgroundColor: '#FAF7F2',
          color: '#3D2C22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '480px',
          }}
        >
          {/* This root error boundary renders outside <html>/<body> of the normal layout and
              can't rely on globals.css custom properties being loaded, so sizes are literal
              px matched to the --text-* scale's computed values rather than var() references. */}
          <p style={{ fontSize: '36px', margin: 0 }} aria-hidden="true">🪔</p>
          <p style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4622A', margin: 0 }}>
            Error
          </p>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#3D2C22', margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#7A6E64', margin: 0, fontSize: '14px' }}>
            A critical error occurred. Please try reloading the page.
          </p>
          {error.digest && (
            <p style={{ fontSize: '12px', color: '#7A6E64', fontFamily: 'monospace', margin: 0 }}>
              {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: '8px',
              padding: '10px 24px',
              borderRadius: '8px',
              background: '#B8860B',
              color: '#fff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
