import { useEffect, useRef, useState } from 'react';
import { X, Copy, Check, RotateCcw, Pipette } from 'lucide-react';
import { isValidHex, normalizeHex, toNativeColorInputValue, getContrastTextColor } from '../../utils/colorUtils';
import { copyToClipboard } from '../../utils/exportUtils';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import './ColorEditorModal.css';

/**
 * Compact Material 3 color editor opened from a role card. Typing/dragging
 * updates its own preview instantly; the (comparatively expensive) app-wide
 * commit — which cascades into CSS variable writes and a phone-preview
 * canvas redraw — is debounced so rapid picker drags don't thrash the rest
 * of the page.
 */
export default function ColorEditorModal({ open, roleKey, roleLabel, value, generatedValue, isOverridden, onChange, onReset, onClose }) {
  const [draft, setDraft] = useState(value || '#000000');
  const [invalid, setInvalid] = useState(false);
  const [copied, setCopied] = useState(false);
  const hexInputRef = useRef(null);

  const commitChange = useDebouncedCallback((hex) => onChange(hex), 90);

  useBodyScrollLock(open);

  // Reset local draft whenever a different role is opened.
  useEffect(() => {
    if (open) {
      setDraft(value || '#000000');
      setInvalid(false);
      setCopied(false);
    }
  }, [open, roleKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const focusTimer = setTimeout(() => hexInputRef.current?.focus(), 120);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleHexInput = (raw) => {
    setDraft(raw);
    if (isValidHex(raw)) {
      setInvalid(false);
      commitChange(normalizeHex(raw));
    } else {
      setInvalid(raw.trim().length > 0);
    }
  };

  const handlePickerInput = (raw) => {
    setDraft(raw);
    setInvalid(false);
    commitChange(normalizeHex(raw));
  };

  const handleCopy = async () => {
    const hex = normalizeHex(draft) || draft;
    try {
      await copyToClipboard(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      // Clipboard permission denied or unavailable — fail quietly.
    }
  };

  const handleReset = () => {
    setDraft(generatedValue);
    setInvalid(false);
    onReset();
  };

  const previewHex = normalizeHex(draft) || value;
  const previewTextColor = getContrastTextColor(previewHex);

  return (
    <div className="color-editor__scrim" onClick={onClose}>
      <div
        className="color-editor"
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${roleLabel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="color-editor__header">
          <p className="md-title-large">{roleLabel}</p>
          <button className="color-editor__close" onClick={onClose} aria-label="Close color editor">
            <X size={18} />
          </button>
        </div>

        <div
          className="color-editor__preview"
          style={{ background: previewHex, color: previewTextColor }}
        >
          <span className="md-title-medium">{previewHex}</span>
          {isOverridden && <span className="color-editor__edited-badge">Edited</span>}
        </div>

        <div className="color-editor__row">
          <label className="color-editor__field" htmlFor={`hex-input-${roleKey}`}>
            <span className="md-label-small">HEX</span>
            <div className={`color-editor__hex-wrap ${invalid ? 'color-editor__hex-wrap--invalid' : ''}`}>
              <span aria-hidden="true">#</span>
              <input
                id={`hex-input-${roleKey}`}
                ref={hexInputRef}
                type="text"
                inputMode="text"
                maxLength={7}
                value={draft.replace('#', '')}
                onChange={(e) => handleHexInput(e.target.value)}
                aria-invalid={invalid}
                aria-describedby={invalid ? `hex-error-${roleKey}` : undefined}
              />
            </div>
            {invalid && (
              <span id={`hex-error-${roleKey}`} className="color-editor__error md-label-small">
                Enter 6 hex digits, e.g. 6750A4
              </span>
            )}
          </label>

          <label className="color-editor__picker" aria-label="Pick a color visually">
            <Pipette size={16} className="color-editor__picker-icon" aria-hidden="true" />
            <input
              type="color"
              value={toNativeColorInputValue(draft)}
              onChange={(e) => handlePickerInput(e.target.value)}
            />
          </label>
        </div>

        <div className="color-editor__actions">
          <button type="button" className="color-editor__action" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            className="color-editor__action"
            onClick={handleReset}
            disabled={!isOverridden}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
