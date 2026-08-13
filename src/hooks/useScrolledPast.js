import { useEffect, useRef, useState } from 'react';

/**
 * Tracks only whether the page has scrolled past `threshold`, without
 * forcing a re-render on every scroll event. The scroll listener is
 * rAF-throttled (at most one check per frame) and only calls setState when
 * the boolean actually flips, instead of firing a state update on every
 * scroll tick.
 */
export function useScrolledPast(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  const stateRef = useRef(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    const check = () => {
      tickingRef.current = false;
      const next = window.scrollY > threshold;
      if (next !== stateRef.current) {
        stateRef.current = next;
        setScrolled(next);
      }
    };

    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(check);
      }
    };

    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}
