import { memo, useEffect, useMemo, useState } from 'react';
import TiltedCard from '../reactbits/TiltedCard';
import FadeContent from '../reactbits/FadeContent';
import BackgroundLayer from '../BackgroundLayer';
import MaterialAndroidPreview from '../ui/MaterialAndroidPreview';
import { renderPhoneMockup } from '../../utils/phoneMockup';
import './PhonePreview.css';

const THEME_MODES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'expressive', label: 'Expressive' }
];

function PhonePreview({ scheme, themeMode, onThemeChange }) {
  const [mockups, setMockups] = useState({ pixel: '', nothing: '' });

  useEffect(() => {
    // Defer one frame so the browser has a chance to finish loading the
    // Roboto Flex / Roboto Mono webfonts used inside the canvas mockups.
    const id = requestAnimationFrame(() => {
      setMockups({
        pixel: renderPhoneMockup(scheme, 'pixel'),
        nothing: renderPhoneMockup(scheme, 'nothing')
      });
    });
    return () => cancelAnimationFrame(id);
  }, [scheme]);

  const canvasPhones = useMemo(
    () => [
      { key: 'pixel', label: 'Pixel', src: mockups.pixel },
      { key: 'nothing', label: 'Nothing OS', src: mockups.nothing }
    ],
    [mockups]
  );

  return (
    <section id="preview" className="section phone-preview">
      <BackgroundLayer themeMode={themeMode} variant="faint" />

      <div className="container phone-preview__container">
        <FadeContent duration={700} blur>
          <span className="section-eyebrow md-label-large">Step 2</span>
          <h2 className="md-headline-large section-heading">See it on a phone</h2>
          <p className="md-body-large section-subheading">
            Your palette applied to three different Android styles — tilt and hover to explore.
          </p>
        </FadeContent>

        <div className="phone-preview__theme-switch" role="group" aria-label="Preview theme">
          {THEME_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`phone-preview__theme-chip ${themeMode === mode.id ? 'phone-preview__theme-chip--active' : ''}`}
              onClick={() => onThemeChange(mode.id)}
              aria-pressed={themeMode === mode.id}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="phone-preview__grid">
          {canvasPhones.map((phone) => (
            <div className="phone-preview__stage" key={phone.key}>
              {phone.src && (
                <TiltedCard
                  imageSrc={phone.src}
                  altText={`${phone.label} home screen preview`}
                  captionText={phone.label}
                  containerHeight="480px"
                  containerWidth="240px"
                  imageHeight="480px"
                  imageWidth="240px"
                  rotateAmplitude={10}
                  scaleOnHover={1.05}
                  showMobileWarning={false}
                  showTooltip={false}
                  displayOverlayContent={false}
                />
              )}
              <p className="md-title-medium phone-preview__label">{phone.label}</p>
            </div>
          ))}

          <div className="phone-preview__stage">
            <MaterialAndroidPreview scheme={scheme} />
            <p className="md-title-medium phone-preview__label">Material Android</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// V2.1: `scheme` stays referentially stable across App re-renders that
// don't actually touch the palette (see useMaterialTheme's memoized
// mergedSchemes), so this correctly skips re-rendering — and therefore
// skips the effect that redraws the two canvas mockups — when something
// unrelated elsewhere on the page changes (a toast appearing, the settings
// modal opening, etc). The DOM-based Material Android preview is even
// cheaper: it has no effect to skip, it just re-renders its (small) tree.
export default memo(PhonePreview);
