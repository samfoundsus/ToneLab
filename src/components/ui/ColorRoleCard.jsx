import { memo, useState, useCallback } from 'react';
import { Copy, Check, Pencil } from 'lucide-react';
import SpotlightCard from '../reactbits/SpotlightCard';
import { copyToClipboard } from '../../utils/exportUtils';
import { getContrastTextColor } from '../../utils/colorUtils';
import './ColorRoleCard.css';

function ColorRoleCard({ label, hex, roleKey, isOverridden, onEdit }) {
  const [copied, setCopied] = useState(false);
  const [ripples, setRipples] = useState([]);
  const textColor = getContrastTextColor(hex);

  const handleCopyAction = useCallback(
    async (e) => {
      e?.stopPropagation();
      try {
        await copyToClipboard(hex);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      } catch (err) {
        // Fallback gracefully
      }
    },
    [hex]
  );

  const handleSwatchClick = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const id = Date.now();
      const ripple = {
        id,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      setRipples((prev) => [...prev, ripple]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);

      handleCopyAction(e);
    },
    [handleCopyAction]
  );

  return (
    <SpotlightCard className="role-card" spotlightColor="rgba(255, 255, 255, 0.06)">
      {/* Visual Color Swatch */}
      <div
        className="role-card__swatch"
        style={{ backgroundColor: hex, color: textColor }}
        onClick={handleSwatchClick}
        role="button"
        tabIndex={0}
        aria-label={`Copy ${label} color ${hex}`}
        title={`Click swatch to copy ${hex}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCopyAction(e);
          }
        }}
      >
        {ripples.map((r) => (
          <span key={r.id} className="role-card__ripple" style={{ left: r.x, top: r.y }} />
        ))}

        {isOverridden && (
          <span className="role-card__edited-badge" title="Manually edited">
            Edited
          </span>
        )}

        <button
          type="button"
          className={`role-card__copy-btn ${copied ? 'role-card__copy-btn--copied' : ''}`}
          onClick={handleCopyAction}
          aria-label={copied ? `Copied ${label}` : `Copy ${label} HEX`}
          title={copied ? 'HEX copied' : 'Copy HEX'}
        >
          {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={2} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="role-card__divider" />

      {/* Semantic Role Info & Edit Action */}
      <div className="role-card__meta">
        <div className="role-card__meta-text">
          <p className="role-card__label" title={label}>
            {label}
          </p>
          <p className="role-card__hex" title={`HEX: ${hex}`}>
            {hex?.toUpperCase()}
          </p>
        </div>

        <button
          type="button"
          className="role-card__edit-btn"
          onClick={() => onEdit(roleKey)}
          aria-label={`Edit ${label} color`}
          title={`Edit ${label}`}
        >
          <Pencil size={15} />
        </button>
      </div>
    </SpotlightCard>
  );
}

export default memo(ColorRoleCard);
