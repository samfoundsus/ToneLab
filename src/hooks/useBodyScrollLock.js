import { useEffect } from 'react';

/**
 * Locks page scroll while `active` is true (used by the two full-screen
 * modals — Settings and the color editor). This is correct modal behavior
 * on its own (the background shouldn't scroll behind an open dialog), and
 * it also removes a real perf concern: the Settings scrim uses a small
 * backdrop-filter blur, which would otherwise have to keep resampling the
 * page underneath it on every scroll frame while open.
 *
 * Only one modal is ever open at a time in this app (each is a full-screen
 * scrim that blocks interaction with anything behind it), so a simple
 * lock/restore is sufficient — no reference counting needed.
 */
export function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}
