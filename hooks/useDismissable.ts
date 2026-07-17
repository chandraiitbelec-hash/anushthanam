import { useEffect, useRef, RefObject } from 'react';

/**
 * Dismiss an open popover/dropdown/drawer when the user clicks outside the
 * referenced element or presses Escape. Listeners are only attached while
 * `open` is true, so closed popovers cost nothing.
 *
 * Returns a ref to attach to the popover's outermost element (the trigger +
 * panel wrapper). Clicks inside that element are ignored.
 *
 * Pass `{ escapeOnly: true }` for surfaces that already handle outside-click
 * themselves (e.g. a full-screen drawer overlay) so this hook only wires up
 * Escape — attaching the outside-click listener there would fight the
 * surface's own toggle button.
 */
export function useDismissable<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
  { escapeOnly = false }: { escapeOnly?: boolean } = {},
): RefObject<T | null> {
  const ref = useRef<T>(null);

  // Keep the latest onClose without re-subscribing on every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCloseRef.current();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseRef.current();
    }
    if (!escapeOnly) document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, escapeOnly]);

  return ref;
}
