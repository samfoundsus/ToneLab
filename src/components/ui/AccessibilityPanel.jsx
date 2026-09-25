import { memo } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { CONTRAST_PAIRS } from '../../utils/materialPalette';
import { contrastRatio, wcagLevel } from '../../utils/colorUtils';
import './AccessibilityPanel.css';

const LEVEL_CONFIG = {
  AAA: {
    label: 'AAA',
    detail: 'Enhanced (7:1+)',
    badgeClass: 'a11y-badge--aaa',
    icon: CheckCircle2,
    pass: true
  },
  AA: {
    label: 'AA',
    detail: 'Standard (4.5:1+)',
    badgeClass: 'a11y-badge--aa',
    icon: ShieldCheck,
    pass: true
  },
  'AA-LARGE': {
    label: 'AA (Large)',
    detail: 'Large text (3:1+)',
    badgeClass: 'a11y-badge--aa-large',
    icon: ShieldCheck,
    pass: true
  },
  FAIL: {
    label: 'Low contrast',
    detail: 'Below 3:1',
    badgeClass: 'a11y-badge--fail',
    icon: ShieldAlert,
    pass: false
  }
};

/**
 * Material 3 WCAG Contrast & Accessibility Laboratory.
 * Evaluates every semantic foreground/background role pair in the current
 * active scheme in real time.
 */
function AccessibilityPanel({ scheme, overrides, onColorReset }) {
  // Count passing vs failing for summary indicator
  let passCount = 0;
  let totalCount = 0;

  CONTRAST_PAIRS.forEach(([bgKey, fgKey]) => {
    const bg = scheme[bgKey];
    const fg = scheme[fgKey];
    if (bg && fg) {
      totalCount += 1;
      const ratio = contrastRatio(bg, fg);
      const level = wcagLevel(ratio);
      if (level !== 'FAIL') passCount += 1;
    }
  });

  return (
    <div className="a11y-panel">
      {/* Compact Panel Header */}
      <div className="a11y-panel__header">
        <div className="a11y-panel__header-row">
          <span className="a11y-panel__category-badge md-label-small">Accessibility Validation</span>
          <span
            className={`a11y-panel__summary-pill ${
              passCount === totalCount ? 'a11y-panel__summary-pill--all-pass' : ''
            }`}
          >
            {passCount}/{totalCount} pairs pass WCAG
          </span>
        </div>
        <h3 className="a11y-panel__title md-title-medium">Contrast &amp; accessibility</h3>
        <p className="a11y-panel__description md-body-small">
          Live WCAG 2.1 compliance for every semantic text-on-surface role combination.
          AA (4.5:1) ensures readable body copy; AAA (7:1) provides optimal contrast across all conditions.
        </p>
      </div>

      {/* Grid of Contrast Cards: 2 columns on desktop */}
      <div className="a11y-panel__grid">
        {CONTRAST_PAIRS.map(([bgKey, fgKey, label]) => {
          const bg = scheme[bgKey];
          const fg = scheme[fgKey];
          if (!bg || !fg) return null;

          const ratio = contrastRatio(bg, fg);
          const level = wcagLevel(ratio);
          const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.FAIL;
          const passing = config.pass;
          const Icon = config.icon;
          const editedRole = overrides?.[bgKey] ? bgKey : overrides?.[fgKey] ? fgKey : null;

          return (
            <div
              key={label}
              className={`a11y-card ${passing ? '' : 'a11y-card--fail'} ${editedRole ? 'a11y-card--edited' : ''}`}
            >
              {/* Card Top: Semantic Pair Name & Secondary Hex Values */}
              <div className="a11y-card__top">
                <p className="a11y-card__role-name" title={label}>
                  {label}
                </p>
                <div className="a11y-card__hex-comparison">
                  <span className="a11y-card__color-dot" style={{ backgroundColor: bg }} title={`Background: ${bg}`} />
                  <code>{bg.toUpperCase()}</code>
                  <span className="a11y-card__slash">/</span>
                  <span className="a11y-card__color-dot" style={{ backgroundColor: fg }} title={`Foreground: ${fg}`} />
                  <code>{fg.toUpperCase()}</code>
                </div>
              </div>

              {/* Card Bottom: [ Sample Text ] on left, [ 9.00:1 \n AAA ] on right */}
              <div className="a11y-card__bottom">
                {/* Live Preview Sample */}
                <div
                  className="a11y-card__sample"
                  style={{ backgroundColor: bg, color: fg }}
                  aria-hidden="true"
                  title={`Sample: text ${fg} on background ${bg}`}
                >
                  <span className="a11y-card__sample-aa">Aa</span>
                  <span className="a11y-card__sample-text">Sample Text</span>
                </div>

                {/* Contrast Ratio & AAA / AA Badge */}
                <div className="a11y-card__metric">
                  <span className="a11y-card__ratio-val">{ratio.toFixed(2)}:1</span>
                  <div className={`a11y-badge ${config.badgeClass}`} title={`${config.label}: ${config.detail}`}>
                    <Icon size={12} strokeWidth={2.4} />
                    <span>{config.label}</span>
                  </div>
                </div>
              </div>

              {/* Action if failing due to manual edit */}
              {!passing && editedRole && (
                <div className="a11y-card__footer">
                  <button
                    type="button"
                    className="a11y-card__fix-btn"
                    onClick={() => onColorReset(editedRole)}
                    title={`Reset ${editedRole} to generated color`}
                  >
                    <RotateCcw size={12} />
                    <span>Reset {editedRole}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(AccessibilityPanel);
