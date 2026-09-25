import { memo, useEffect, useMemo, useState } from 'react';
import { Sun, Moon, Sparkles, Smartphone } from 'lucide-react';
import TiltedCard from '../reactbits/TiltedCard';
import FadeContent from '../reactbits/FadeContent';
import BackgroundLayer from '../BackgroundLayer';
import MaterialAndroidPreview from '../ui/MaterialAndroidPreview';
import { renderPhoneMockup } from '../../utils/phoneMockup';
import './PhonePreview.css';

const THEME_MODES = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'expressive', label: 'Expressive', icon: Sparkles }
];

const DEVICE_OPTIONS = [
  {
    id: 'pixel',
    label: 'Pixel',
    systemName: 'Google Pixel',
    description: 'Material You launcher with dynamic dual-tone clock, At a Glance widget, and wallpaper-tinted system surfaces.'
  },
  {
    id: 'nothing',
    label: 'Nothing OS',
    systemName: 'Nothing OS',
    description: 'OLED-black minimalism featuring dot-matrix typography, glyph ring clock, and surgical Material You accent cards.'
  },
  {
    id: 'material',
    label: 'Material Android',
    systemName: 'Material 3 App',
    description: 'Standard Material 3 application UI demonstrating top app bar, tonal container cards, FAB, and navigation bar.'
  }
];

function PhonePreview({ scheme, themeMode, onThemeChange }) {
  const [mockups, setMockups] = useState({ pixel: '', nothing: '' });
  const [selectedDevice, setSelectedDevice] = useState('pixel');

  useEffect(() => {
    let cancelled = false;

    const generate = () => {
      if (cancelled) return;
      setMockups({
        pixel: renderPhoneMockup(scheme, 'pixel', themeMode),
        nothing: renderPhoneMockup(scheme, 'nothing', themeMode)
      });
    };

    // Render immediately
    generate();

    // Re-render once web fonts (Roboto Flex / Roboto Mono) are fully loaded
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) generate();
      });
    }

    return () => {
      cancelled = true;
    };
  }, [scheme, themeMode]);

  const activeDeviceInfo = useMemo(
    () => DEVICE_OPTIONS.find((d) => d.id === selectedDevice) || DEVICE_OPTIONS[0],
    [selectedDevice]
  );

  return (
    <section id="preview" className="section phone-preview">
      <BackgroundLayer themeMode={themeMode} variant="faint" />

      <div className="container phone-preview__container">
        <FadeContent duration={600} blur>
          {/* Centered Section Header */}
          <header className="phone-preview__header">
            <span className="section-eyebrow md-label-large">Step 2</span>
            <h2 className="md-headline-large section-heading">See it on a phone</h2>
            <p className="md-body-large section-subheading">
              Experience your generated Material You palette in real time across three Android visual styles.
            </p>
          </header>

          {/* Unified Lightweight Controls Area */}
          <div className="phone-preview__controls-panel" id="themes">
            <div className="phone-preview__selectors-row">
              {/* Theme Style Group */}
              <div className="phone-preview__control-group">
                <span className="phone-preview__group-label md-label-small">Theme Style</span>
                <div className="phone-preview__segmented" role="group" aria-label="Theme Style Mode">
                  {THEME_MODES.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = themeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        className={`phone-preview__seg-btn ${isActive ? 'phone-preview__seg-btn--active' : ''}`}
                        onClick={() => onThemeChange(mode.id)}
                        aria-pressed={isActive}
                      >
                        <Icon size={15} strokeWidth={2.2} />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subtle Center Divider on Desktop */}
              <div className="phone-preview__bar-divider" aria-hidden="true" />

              {/* Preview Style Group */}
              <div className="phone-preview__control-group">
                <span className="phone-preview__group-label md-label-small">Preview Style</span>
                <div className="phone-preview__segmented" role="tablist" aria-label="Preview Style">
                  {DEVICE_OPTIONS.map((device) => {
                    const isActive = selectedDevice === device.id;
                    return (
                      <button
                        key={device.id}
                        type="button"
                        role="tab"
                        className={`phone-preview__seg-btn ${isActive ? 'phone-preview__seg-btn--active' : ''}`}
                        onClick={() => setSelectedDevice(device.id)}
                        aria-selected={isActive}
                      >
                        <Smartphone size={14} />
                        <span>{device.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Compact Contextual Description Bar */}
            <div className="phone-preview__context-bar">
              <span className="phone-preview__context-badge">{activeDeviceInfo.systemName}</span>
              <p className="phone-preview__context-text md-body-medium">
                {activeDeviceInfo.description}
              </p>
            </div>
          </div>

          {/* Centered Phone Showcase (Visual Focal Point) */}
          <div className="phone-preview__showcase">
            <TiltedCard
              captionText={activeDeviceInfo.systemName}
              containerHeight="600px"
              containerWidth="300px"
              imageHeight="600px"
              imageWidth="300px"
              rotateAmplitude={6}
              scaleOnHover={1.02}
              showMobileWarning={false}
              showTooltip={false}
            >
              <div className="phone-device" data-device={selectedDevice}>
                {/* Hardware button accents */}
                <div className="phone-device__btn phone-device__btn--volume" aria-hidden="true" />
                <div className="phone-device__btn phone-device__btn--power" aria-hidden="true" />

                {/* Chassis */}
                <div className="phone-device__chassis">
                  {/* Top bezel: speaker slit & punch-hole camera */}
                  <div className="phone-device__speaker" aria-hidden="true" />
                  <div className="phone-device__camera" aria-hidden="true">
                    <span className="phone-device__camera-lens" />
                  </div>

                  {/* Screen content */}
                  <div className="phone-device__screen">
                    {selectedDevice === 'pixel' && mockups.pixel && (
                      <img
                        src={mockups.pixel}
                        alt="Google Pixel Material You home screen preview"
                        className="phone-device__img"
                      />
                    )}
                    {selectedDevice === 'nothing' && mockups.nothing && (
                      <img
                        src={mockups.nothing}
                        alt="Nothing OS home screen preview"
                        className="phone-device__img"
                      />
                    )}
                    {selectedDevice === 'material' && (
                      <MaterialAndroidPreview scheme={scheme} themeMode={themeMode} />
                    )}

                    {/* Subtle glass reflection overlay */}
                    <div className="phone-device__glare" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </TiltedCard>
          </div>
        </FadeContent>
      </div>
    </section>
  );
}

export default memo(PhonePreview);
