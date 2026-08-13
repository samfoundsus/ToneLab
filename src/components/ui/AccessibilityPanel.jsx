import { memo } from 'react';
import { ShieldCheck, ShieldAlert, RotateCcw } from 'lucide-react';
import { CONTRAST_PAIRS } from '../../utils/materialPalette';
import { contrastRatio, wcagLevel } from '../../utils/colorUtils';
import './AccessibilityPanel.css';

const LEVEL_COPY = {
  AAA: 'AAA',
  AA: 'AA',
  'AA-LARGE': 'AA (large text)',
  FAIL: 'Low contrast'
};

/**
 * V3: a compact WCAG contrast check for every foreground/background pair
 * that actually appears in the UI (see CONTRAST_PAIRS). Reuses the existing
 * scheme/overrides/reset plumbing from ColorRoles — this is presentation
 * only, no second theme or color system.
 */
function AccessibilityPanel({ scheme, overrides, onColorReset }) {
  return (
    <div className="a11y-panel">
      <div className="a11y-panel__header">
        <h3 className="md-title-large">Contrast &amp; accessibility</h3>
        <p className="md-body-medium">
          WCAG contrast for every role pair used as text-on-surface in the app. AA (4.5:1) is the bar for normal
          text; large text and icons only need 3:1.
        </p>
      </div>

      <div className="a11y-panel__grid">
        {CONTRAST_PAIRS.map(([bgKey, fgKey, label]) => {
          const bg = scheme[bgKey];
          const fg = scheme[fgKey];
          if (!bg || !fg) return null;

          const ratio = contrastRatio(bg, fg);
          const level = wcagLevel(ratio);
          const passing = level !== 'FAIL';
          const editedRole = overrides?.[bgKey] ? bgKey : overrides?.[fgKey] ? fgKey : null;

          return (
            <div key={label} className={`a11y-row ${passing ? '' : 'a11y-row--fail'}`}>
              <div className="a11y-row__sample" style={{ background: bg, color: fg }} aria-hidden="true">
                Aa
              </div>
              <div className="a11y-row__info">
                <p className="md-title-medium a11y-row__label">{label}</p>
                <p className="md-label-small">{ratio.toFixed(2)}:1</p>
              </div>
              <span className={`a11y-badge a11y-badge--${passing ? 'pass' : 'fail'}`}>
                {passing ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                {LEVEL_COPY[level]}
              </span>
              {!passing && editedRole && (
                <button
                  type="button"
                  className="a11y-row__fix"
                  onClick={() => onColorReset(editedRole)}
                  title={`Reset ${editedRole} to its generated value`}
                >
                  <RotateCcw size={13} /> Use generated color
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(AccessibilityPanel);
