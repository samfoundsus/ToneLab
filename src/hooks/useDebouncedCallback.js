import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a debounced version of `callback` that only fires `delay`ms after
 * the last call. Used to keep expensive work (palette recompute, phone-mockup
 * canvas redraw, CSS variable writes) off the hot path while a user is
 * actively dragging a color picker or typing a hex value.
 */
export function useDebouncedCallback(callback, delay = 80) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
