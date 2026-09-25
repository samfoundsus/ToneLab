import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Copy, Check, RotateCcw, Pipette, Sliders } from 'lucide-react';
import {
  isValidHex,
  normalizeHex,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToHex,
  hexToHsl,
  clamp,
  toNativeColorInputValue,
  getContrastTextColor
} from '../../utils/colorUtils';
import { copyToClipboard } from '../../utils/exportUtils';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import './ColorEditorModal.css';

/**
 * Material 3 Color Editor Modal.
 * Supports:
 * - HEX input with real-time validation
 * - Native color picker with visual trigger
 * - RGB numeric inputs (R, G, B)
 * - HSL numeric inputs (H, S, L)
 * - Live contrast-aware preview
 * - Direct comparison with original wallpaper-generated color
 * - Instant update to the rest of the application
 */
export default function ColorEditorModal({
  open,
  roleKey,
  roleLabel,
  value,
  generatedValue,
  isOverridden,
  onChange,
  onReset,
  onClose
}) {
  const [draftHex, setDraftHex] = useState(value || '#000000');
  const [hexInputText, setHexInputText] = useState((value || '#000000').replace('#', ''));
  const [rgb, setRgb] = useState(() => hexToRgb(value || '#000000'));
  const [hsl, setHsl] = useState(() => hexToHsl(value || '#000000'));
  const [colorMode, setColorMode] = useState('rgb'); // 'rgb' | 'hsl'
  const [isInvalidHex, setIsInvalidHex] = useState(false);
  const [copied, setCopied] = useState(false);

  const hexInputRef = useRef(null);
  const colorPickerInputRef = useRef(null);

  // Debounce the parent update so rapid slider/typing doesn't thrash canvas redraws
  const commitParentChange = useDebouncedCallback((hex) => {
    onChange(hex);
  }, 40);

  useBodyScrollLock(open);

  // Sync state when opening or when role changes
  useEffect(() => {
    if (open) {
      const initialHex = normalizeHex(value) || '#000000';
      setDraftHex(initialHex);
      setHexInputText(initialHex.replace('#', ''));
      setRgb(hexToRgb(initialHex));
      setHsl(hexToHsl(initialHex));
      setIsInvalidHex(false);
      setCopied(false);
    }
  }, [open, roleKey, value]);

  // Handle ESC key and initial focus
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const timer = setTimeout(() => hexInputRef.current?.focus(), 100);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      clearTimeout(timer);
    };
  }, [open, onClose]);

  // Sync helper: apply a new hex code to all representations and notify parent
  const applyHex = useCallback(
    (newHex, syncTextInput = true) => {
      const normalized = normalizeHex(newHex);
      if (normalized) {
        setDraftHex(normalized);
        if (syncTextInput) {
          setHexInputText(normalized.replace('#', ''));
        }
        setRgb(hexToRgb(normalized));
        setHsl(hexToHsl(normalized));
        setIsInvalidHex(false);
        commitParentChange(normalized);
      }
    },
    [commitParentChange]
  );

  // HEX input handler
  const handleHexChange = (raw) => {
    const cleaned = raw.replace('#', '').toUpperCase();
    setHexInputText(cleaned);

    if (isValidHex(cleaned)) {
      setIsInvalidHex(false);
      applyHex(`#${cleaned}`, false);
    } else {
      setIsInvalidHex(cleaned.trim().length > 0);
    }
  };

  // Color picker handler
  const handlePickerChange = (raw) => {
    applyHex(raw, true);
  };

  // RGB handlers
  const handleRgbChange = (channel, rawVal) => {
    const num = parseInt(rawVal, 10);
    const val = Number.isNaN(num) ? 0 : clamp(num, 0, 255);
    const updated = { ...rgb, [channel]: val };
    setRgb(updated);
    const nextHex = rgbToHex(updated);
    setDraftHex(nextHex);
    setHexInputText(nextHex.replace('#', ''));
    setHsl(rgbToHsl(updated));
    setIsInvalidHex(false);
    commitParentChange(nextHex);
  };

  // HSL handlers
  const handleHslChange = (channel, rawVal) => {
    const num = parseFloat(rawVal);
    const max = channel === 'h' ? 360 : 100;
    const val = Number.isNaN(num) ? 0 : clamp(num, 0, max);
    const updated = { ...hsl, [channel]: val };
    setHsl(updated);
    const nextHex = hslToHex(updated.h, updated.s, updated.l);
    setDraftHex(nextHex);
    setHexInputText(nextHex.replace('#', ''));
    setRgb(hexToRgb(nextHex));
    setIsInvalidHex(false);
    commitParentChange(nextHex);
  };

  // Copy HEX action
  const handleCopy = async () => {
    try {
      await copyToClipboard(draftHex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (err) {
      // Fallback quietly
    }
  };

  // Reset to generated wallpaper color
  const handleReset = () => {
    if (generatedValue) {
      const normalized = normalizeHex(generatedValue) || '#000000';
      setDraftHex(normalized);
      setHexInputText(normalized.replace('#', ''));
      setRgb(hexToRgb(normalized));
      setHsl(hexToHsl(normalized));
      setIsInvalidHex(false);
      onReset();
    }
  };

  if (!open) return null;

  const previewTextColor = getContrastTextColor(draftHex);
  const isCurrentlyOverridden = isOverridden || draftHex.toUpperCase() !== (generatedValue || '').toUpperCase();

  return (
    <div className="color-editor__scrim" onClick={onClose}>
      <div
        className="color-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="color-editor-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="color-editor__header">
          <div>
            <span className="color-editor__role-badge">Semantic Role</span>
            <h3 id="color-editor-title" className="color-editor__title md-title-large">
              {roleLabel}
            </h3>
          </div>
          <button
            type="button"
            className="color-editor__close"
            onClick={onClose}
            aria-label="Close color editor"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Color Swatch Banner */}
        <div
          className="color-editor__preview"
          style={{ backgroundColor: draftHex, color: previewTextColor }}
        >
          <div className="color-editor__preview-top">
            <span className="color-editor__preview-role">{roleLabel}</span>
            {isCurrentlyOverridden && (
              <span className="color-editor__preview-status color-editor__preview-status--edited">
                Custom Edit
              </span>
            )}
          </div>

          <div className="color-editor__preview-bottom">
            <span className="color-editor__preview-hex">{draftHex}</span>
            <button
              type="button"
              className={`color-editor__copy-btn ${copied ? 'color-editor__copy-btn--copied' : ''}`}
              onClick={handleCopy}
              aria-label={copied ? 'HEX copied' : 'Copy HEX'}
            >
              {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
              <span>{copied ? 'Copied' : 'Copy HEX'}</span>
            </button>
          </div>
        </div>

        {/* Revert to Generated Comparison Strip */}
        {isCurrentlyOverridden && generatedValue && (
          <div className="color-editor__comparison">
            <span className="color-editor__comparison-label">Generated from wallpaper:</span>
            <span
              className="color-editor__revert-swatch"
              style={{ backgroundColor: generatedValue }}
              title={`Generated: ${generatedValue}`}
            />
            <code className="color-editor__revert-hex">{generatedValue.toUpperCase()}</code>
            <button
              type="button"
              className="color-editor__revert-chip"
              onClick={handleReset}
              title="Revert to wallpaper-extracted color"
            >
              <RotateCcw size={12} />
              <span>Revert</span>
            </button>
          </div>
        )}

        {/* Controls: Picker + HEX Input */}
        <div className="color-editor__controls">
          {/* Visual Picker Trigger */}
          <div className="color-editor__picker-wrapper">
            <span className="color-editor__field-label">Picker</span>
            <button
              type="button"
              className="color-editor__picker-trigger"
              onClick={() => colorPickerInputRef.current?.click()}
              aria-label="Pick color visually"
            >
              <span
                className="color-editor__picker-swatch"
                style={{ backgroundColor: draftHex }}
              />
              <span className="color-editor__picker-label">Choose</span>
              <Pipette size={14} className="color-editor__picker-icon" />
            </button>
            <input
              ref={colorPickerInputRef}
              type="color"
              className="color-editor__native-picker"
              value={toNativeColorInputValue(draftHex)}
              onChange={(e) => handlePickerChange(e.target.value)}
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>

          {/* HEX Input */}
          <div className="color-editor__hex-group">
            <label htmlFor="color-editor-hex-input" className="color-editor__field-label">
              HEX
            </label>
            <div
              className={`color-editor__hex-box ${isInvalidHex ? 'color-editor__hex-box--invalid' : ''}`}
            >
              <span className="color-editor__hex-prefix">#</span>
              <input
                id="color-editor-hex-input"
                ref={hexInputRef}
                type="text"
                maxLength={7}
                value={hexInputText}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="RRGGBB"
                className="color-editor__hex-input"
                autoComplete="off"
                spellCheck="false"
              />
            </div>
            {isInvalidHex && (
              <span className="color-editor__error">Valid 6-digit hex required</span>
            )}
          </div>
        </div>

        {/* Color Model Tab (RGB vs HSL) */}
        <div className="color-editor__channel-section">
          <div className="color-editor__channel-header">
            <span className="color-editor__field-label">Color Channels</span>
            <div className="color-editor__mode-toggle" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={colorMode === 'rgb'}
                className={`color-editor__mode-btn ${colorMode === 'rgb' ? 'color-editor__mode-btn--active' : ''}`}
                onClick={() => setColorMode('rgb')}
              >
                RGB
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={colorMode === 'hsl'}
                className={`color-editor__mode-btn ${colorMode === 'hsl' ? 'color-editor__mode-btn--active' : ''}`}
                onClick={() => setColorMode('hsl')}
              >
                HSL
              </button>
            </div>
          </div>

          {/* RGB Inputs */}
          {colorMode === 'rgb' && (
            <div className="color-editor__channels-grid">
              <div className="color-editor__channel-col">
                <label htmlFor="rgb-r" className="color-editor__channel-label">
                  R (Red)
                </label>
                <input
                  id="rgb-r"
                  type="number"
                  min={0}
                  max={255}
                  value={rgb.r}
                  onChange={(e) => handleRgbChange('r', e.target.value)}
                  className="color-editor__channel-input"
                />
              </div>
              <div className="color-editor__channel-col">
                <label htmlFor="rgb-g" className="color-editor__channel-label">
                  G (Green)
                </label>
                <input
                  id="rgb-g"
                  type="number"
                  min={0}
                  max={255}
                  value={rgb.g}
                  onChange={(e) => handleRgbChange('g', e.target.value)}
                  className="color-editor__channel-input"
                />
              </div>
              <div className="color-editor__channel-col">
                <label htmlFor="rgb-b" className="color-editor__channel-label">
                  B (Blue)
                </label>
                <input
                  id="rgb-b"
                  type="number"
                  min={0}
                  max={255}
                  value={rgb.b}
                  onChange={(e) => handleRgbChange('b', e.target.value)}
                  className="color-editor__channel-input"
                />
              </div>
            </div>
          )}

          {/* HSL Inputs */}
          {colorMode === 'hsl' && (
            <div className="color-editor__channels-grid">
              <div className="color-editor__channel-col">
                <label htmlFor="hsl-h" className="color-editor__channel-label">
                  H (Hue °)
                </label>
                <input
                  id="hsl-h"
                  type="number"
                  min={0}
                  max={360}
                  value={Math.round(hsl.h)}
                  onChange={(e) => handleHslChange('h', e.target.value)}
                  className="color-editor__channel-input"
                />
              </div>
              <div className="color-editor__channel-col">
                <label htmlFor="hsl-s" className="color-editor__channel-label">
                  S (Sat %)
                </label>
                <input
                  id="hsl-s"
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(hsl.s)}
                  onChange={(e) => handleHslChange('s', e.target.value)}
                  className="color-editor__channel-input"
                />
              </div>
              <div className="color-editor__channel-col">
                <label htmlFor="hsl-l" className="color-editor__channel-label">
                  L (Light %)
                </label>
                <input
                  id="hsl-l"
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(hsl.l)}
                  onChange={(e) => handleHslChange('l', e.target.value)}
                  className="color-editor__channel-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="color-editor__actions">
          <button
            type="button"
            className="color-editor__btn color-editor__btn--reset"
            onClick={handleReset}
            disabled={!isCurrentlyOverridden}
            title="Reset role to generated color"
          >
            <RotateCcw size={14} />
            <span>Reset to original</span>
          </button>

          <div className="color-editor__actions-right">
            <button
              type="button"
              className="color-editor__btn color-editor__btn--save"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
