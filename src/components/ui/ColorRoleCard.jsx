import { memo, useState } from 'react';
import { Copy, Check, Pencil } from 'lucide-react';
import SpotlightCard from '../reactbits/SpotlightCard';
import { copyToClipboard } from '../../utils/exportUtils';
import { getContrastTextColor } from '../../utils/colorUtils';
import './ColorRoleCard.css';

function ColorRoleCard({ label, hex, roleKey, isOverridden, onEdit }) {
  const [copied, setCopied] = useState(false);
  const [ripples, setRipples] = useState([]);
  const textColor = getContrastTextColor(hex);

  const handleClick = async (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    const ripple = {
      id,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setRipples((r) => [...r, ripple]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 650);

    try {
      await copyToClipboard(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (err) {
      // Clipboard permission denied or unavailable — fail quietly rather
      // than leaving the ripple/ui in a broken state.
    }
  };

  return (
    <SpotlightCard className="role-card" spotlightColor="rgba(255,255,255,0.08)">
      <button
        type="button"
        className="role-card__swatch"
        style={{ background: hex, color: textColor }}
        onClick={handleClick}
        aria-label={`Copy ${label} hex code ${hex}`}
      >
        {ripples.map((r) => (
          <span key={r.id} className="role-card__ripple" style={{ left: r.x, top: r.y }} />
        ))}
        {isOverridden && <span className="role-card__edited-dot" title="Manually edited" aria-hidden="true" />}
        <span className="role-card__copy-indicator">
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </span>
      </button>
      <div className="role-card__meta">
        <div className="role-card__meta-text">
          <p className="md-title-medium role-card__label">{label}</p>
          <p className="md-label-small role-card__hex">{hex}</p>
        </div>
        <button
          type="button"
          className="role-card__edit-btn"
          onClick={() => onEdit(roleKey)}
          aria-label={`Edit ${label} color`}
        >
          <Pencil size={14} />
        </button>
      </div>
    </SpotlightCard>
  );
}

export default memo(ColorRoleCard);
