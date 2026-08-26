'use client';

import { useEffect } from 'react';

// Fade-out trigger for the launch splash rendered by PwaSplash.
//
// The fade used to be pure CSS with a hardcoded delay, which starts counting
// the moment pwa-splash-init flags <html> — before paint, and blind to whether
// the real page underneath is visible yet. On a warm launch the clock roughly
// matched real load time; on a cold launch (standalone container startup, per-
// request render, slower network) the splash finished and vanished while the
// page was still blank, which reads as "the loader disappeared before I saw it".
//
// So the fade now waits for BOTH:
//   1. the app actually being visible — this effect running means the page
//      hydrated, and we additionally wait for webfonts to settle plus one real
//      paint frame, so text is drawn rather than swapping in after the fade;
//   2. MIN_HOLD_MS elapsed since the splash first showed, so a fast warm
//      launch still gets the whole lotus bloom instead of a subliminal flash.
// MAX_HOLD_MS caps the wait so a genuinely broken/very slow load can never
// trap the visitor behind the splash. A long-delay CSS fallback in
// app/globals.css covers the case where this component never runs at all.

// Matches the choreography in app/globals.css: core -> petals -> rays settles
// at ~2.1s; the rest is a beat to hold the finished flower before it fades.
const MIN_HOLD_MS = 2900;
const MAX_HOLD_MS = 6000;

export default function PwaSplashFade() {
  useEffect(() => {
    // Regular browser visits never get .pwa-launch — nothing to fade, and no
    // timers to schedule.
    if (!document.documentElement.classList.contains('pwa-launch')) return;
    const splash = document.getElementById('pwa-splash');
    if (!splash) return;

    // pwa-splash-init stamps this at the instant it flags <html>, i.e. before
    // first paint — a truer "when did the splash appear" than mount time.
    const stamped = (window as Window & { __pwaSplashAt?: number }).__pwaSplashAt;
    const startedAt = typeof stamped === 'number' ? stamped : performance.now();
    const elapsed = () => performance.now() - startedAt;

    let faded = false;
    let cancelled = false;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    let rafId = 0;

    const fadeOut = () => {
      if (faded) return;
      faded = true;
      splash.classList.add('pwa-splash-out');
    };

    const capTimer = setTimeout(fadeOut, Math.max(MAX_HOLD_MS - elapsed(), 0));

    const holdThenFade = () => {
      if (cancelled) return;
      holdTimer = setTimeout(fadeOut, Math.max(MIN_HOLD_MS - elapsed(), 0));
    };

    // Two frames: the first is scheduled before the next paint, the second
    // runs after it — so we know the content has actually been drawn.
    const afterPaint = () => {
      if (cancelled) return;
      // A backgrounded tab never runs rAF, and there is nothing visible to
      // wait for anyway — go straight to the hold rather than stalling all
      // the way out to MAX_HOLD_MS.
      if (document.hidden) {
        holdThenFade();
        return;
      }
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(holdThenFade);
      });
    };

    const fonts = document.fonts;
    if (fonts && typeof fonts.ready?.then === 'function') {
      fonts.ready.then(afterPaint, afterPaint);
    } else {
      afterPaint();
    }

    return () => {
      cancelled = true;
      clearTimeout(capTimer);
      if (holdTimer) clearTimeout(holdTimer);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
