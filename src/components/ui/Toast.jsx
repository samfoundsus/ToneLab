import { CheckCircle2 } from 'lucide-react';
import './Toast.css';

/**
 * A single, shared, lightweight notification surface used across the app
 * (share link copied, palette restored, etc.) so every feature has one
 * consistent, non-intrusive way to confirm an action instead of inventing
 * its own alert/toast each time.
 */
export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <CheckCircle2 size={16} />
      <span className="md-label-large">{message}</span>
    </div>
  );
}
