import { memo, useMemo } from 'react';
import { ArrowDown } from 'lucide-react';
import SplitText from '../reactbits/SplitText';
import MaterialButton from '../ui/MaterialButton';
import './Hero.css';

function Hero({ onGetStarted, textColor, scheme }) {
  const swatches = useMemo(
    () => [
      {
        role: 'Primary',
        token: scheme?.primary ? scheme.primary.toUpperCase() : 'Tone 40',
        bgVar: 'var(--md-sys-color-primary)',
        fgVar: 'var(--md-sys-color-on-primary)'
      },
      {
        role: 'Container',
        token: scheme?.primaryContainer ? scheme.primaryContainer.toUpperCase() : 'Tone 90',
        bgVar: 'var(--md-sys-color-primary-container)',
        fgVar: 'var(--md-sys-color-on-primary-container)'
      },
      {
        role: 'Secondary',
        token: scheme?.secondary ? scheme.secondary.toUpperCase() : 'Tone 40',
        bgVar: 'var(--md-sys-color-secondary)',
        fgVar: 'var(--md-sys-color-on-secondary)'
      },
      {
        role: 'Tertiary',
        token: scheme?.tertiary ? scheme.tertiary.toUpperCase() : 'Tone 40',
        bgVar: 'var(--md-sys-color-tertiary)',
        fgVar: 'var(--md-sys-color-on-tertiary)'
      },
      {
        role: 'Surface',
        token: scheme?.surface ? scheme.surface.toUpperCase() : 'Tone 10',
        bgVar: 'var(--md-sys-color-surface-container-high)',
        fgVar: 'var(--md-sys-color-on-surface)',
        border: true
      }
    ],
    [scheme]
  );

  return (
    <section id="hero" className="hero" style={{ '--hero-fg': textColor }}>
      <div className="container hero__content">
        <span className="section-eyebrow md-label-large">Material Design 3 · Dynamic Tonal System</span>

        <SplitText
          text="ToneLab"
          tag="h1"
          className="md-display-large hero__heading"
          splitType="chars"
          delay={20}
          duration={0.7}
          ease="power3.out"
          from={{ opacity: 0, y: 28 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="0px"
        />

        <p className="md-body-large hero__subtitle">
          Generate beautiful Material You color palettes from wallpapers.
        </p>

        <div className="hero__cta">
          <MaterialButton
            variant="filled"
            className="hero__cta-btn"
            onClick={onGetStarted}
            icon={ArrowDown}
          >
            Get Started
          </MaterialButton>
        </div>

        {/* Desktop-only subtle Material You tonal specimen */}
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__specimen-card">
            <div className="hero__specimen-header">
              <div className="hero__specimen-title">
                <span className="hero__specimen-dot" />
                <span>Dynamic Palette Specimen</span>
              </div>
              <span className="hero__specimen-badge">WCAG AA Contrast Compliant</span>
            </div>

            <div className="hero__specimen-grid">
              {swatches.map((item) => (
                <div key={item.role} className="hero__specimen-col">
                  <div
                    className="hero__specimen-swatch"
                    style={{
                      backgroundColor: item.bgVar,
                      color: item.fgVar,
                      border: item.border
                        ? '1px solid var(--md-sys-color-outline-variant)'
                        : '1px solid transparent'
                    }}
                  >
                    <span className="hero__specimen-token">{item.token}</span>
                  </div>
                  <div className="hero__specimen-label-wrap">
                    <span className="hero__specimen-role">{item.role}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hero__specimen-footer">
              <div className="hero__specimen-spectrum">
                <span
                  className="hero__specimen-spectrum-bar"
                  style={{ backgroundColor: 'var(--md-sys-color-primary)' }}
                />
                <span
                  className="hero__specimen-spectrum-bar"
                  style={{ backgroundColor: 'var(--md-sys-color-primary-container)' }}
                />
                <span
                  className="hero__specimen-spectrum-bar"
                  style={{ backgroundColor: 'var(--md-sys-color-secondary)' }}
                />
                <span
                  className="hero__specimen-spectrum-bar"
                  style={{ backgroundColor: 'var(--md-sys-color-secondary-container)' }}
                />
                <span
                  className="hero__specimen-spectrum-bar"
                  style={{ backgroundColor: 'var(--md-sys-color-tertiary)' }}
                />
                <span
                  className="hero__specimen-spectrum-bar"
                  style={{ backgroundColor: 'var(--md-sys-color-surface-container-high)' }}
                />
              </div>
              <span className="hero__specimen-caption">
                Wallpaper-derived tonal ramps harmonized across components
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Hero);
