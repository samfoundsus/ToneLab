import { useCallback, useRef, useState } from 'react';

/** Minimal shared toast state: one message at a time, auto-dismissed. */
export function useToast(duration = 2400) {
  const [message, setMessage] = useState('');
  const [toastKey, setToastKey] = useState(0);
  const timeoutRef = useRef(null);

  const showToast = useCallback((text) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage(text);
    setToastKey((k) => k + 1); // forces the entrance animation to replay, even for repeat messages
    timeoutRef.current = setTimeout(() => setMessage(''), duration);
  }, [duration]);

  return { toastMessage: message, toastKey, showToast };
}
