import { Sun, Moon, Sparkles, Check } from 'lucide-react';
import PixelTransition from '../reactbits/PixelTransition';
import FadeContent from '../reactbits/FadeContent';
import BackgroundLayer from '../BackgroundLayer';
import './ThemeSelector.css';

const THEMES = [
  {
    id: 'light',
    name: 'Material Light',
    description: 'Bright surfaces, tonal containers.',
    icon: Sun
  },
  {
    id: 'dark',
    name: 'Material Dark',
    description: 'Low-light, high-contrast surfaces.',
    icon: Moon
  },
  {
    id: 'expressive',
    name: 'Material Expressive',
    description: 'Android 16 — bolder chroma, deeper containers.',
    icon: Sparkles
  }
];

export default function ThemeSelector({ schemes, themeMode, onSelect }) {
  return (
    <section id="themes" className="section theme-selector">
      <BackgroundLayer themeMode={themeMode} variant="faint" />
      <div className="container theme-selector__container">
        <FadeContent duration={700} blur>
          <span className="section-eyebrow md-label-large">Step 3</span>
          <h2 className="md-headline-large section-heading">Pick a theme</h2>
          <p className="md-body-large section-subheading">
            Hover a card to preview it, tap to apply it across the whole studio.
          </p>
        </FadeContent>

        <div className="theme-selector__grid">
          {THEMES.map((theme) => {
            const scheme = schemes[theme.id];
            const Icon = theme.icon;
            const isActive = themeMode === theme.id;
            return (
              <div
                key={theme.id}
                className={`theme-card-wrap ${isActive ? 'theme-card-wrap--active' : ''}`}
                onClick={() => onSelect(theme.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(theme.id)}
              >
                <PixelTransition
                  gridSize={10}
                  pixelColor={scheme.primary}
                  animationStepDuration={0.35}
                  className="theme-pixel-card"
                  style={{ width: '100%' }}
                  aspectRatio="118%"
                  firstContent={
                    <div className="theme-card-face theme-card-face--first" style={{ background: scheme.surfaceContainer, color: scheme.onSurface }}>
                      <span className="theme-card-icon" style={{ background: scheme.primaryContainer, color: scheme.onPrimaryContainer }}>
                        <Icon size={22} />
                      </span>
                      <p className="md-title-large">{theme.name}</p>
                      <p className="md-body-medium">{theme.description}</p>
                      {isActive && (
                        <span className="theme-card-active-pill" style={{ background: scheme.primary, color: scheme.onPrimary }}>
                          <Check size={14} /> Active
                        </span>
                      )}
                    </div>
                  }
                  secondContent={
                    <div className="theme-card-face theme-card-face--second" style={{ background: scheme.surface }}>
                      <div className="theme-card-swatches">
                        {['primary', 'secondary', 'tertiary', 'surfaceVariant', 'error'].map((role) => (
                          <span key={role} className="theme-card-swatch" style={{ background: scheme[role] }} />
                        ))}
                      </div>
                      <p className="md-label-large" style={{ color: scheme.onSurface }}>Tap to apply</p>
                    </div>
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
