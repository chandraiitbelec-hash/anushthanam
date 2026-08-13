'use client';

import { useEffect } from 'react';

// Registers the installability-only service worker (public/sw.js). Renders
// nothing — this is a side-effect-only client component so the server tree
// above it (language/theme cookie seeding) stays untouched.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  return null;
}
