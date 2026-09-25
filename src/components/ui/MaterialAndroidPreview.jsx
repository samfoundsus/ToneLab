import { memo } from 'react';
import {
  Menu,
  Search,
  MoreVertical,
  Plus,
  Home,
  Palette,
  Sliders,
  User,
  Check,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { getContrastTextColor } from '../../utils/colorUtils';
import './MaterialAndroidPreview.css';

const NAV_TABS = [
  { icon: Home, label: 'Home', active: true },
  { icon: Palette, label: 'Palette', active: false },
  { icon: Sliders, label: 'Tokens', active: false },
  { icon: User, label: 'System', active: false }
];

function MaterialAndroidPreview({ scheme, themeMode = 'dark' }) {
  const isExpressive = themeMode === 'expressive';
  const isDark = themeMode === 'dark';

  return (
    <div
      className="md-preview"
      style={{ background: scheme.surface, color: scheme.onSurface }}
      aria-hidden="true"
    >
      {/* 1. Status Bar */}
      <div className="md-preview__statusbar" style={{ color: scheme.onSurface }}>
        <span className="md-preview__status-time">9:41</span>
        <div className="md-preview__status-icons">
          <span className="md-preview__signal-bars">
            <span style={{ height: '4px', background: scheme.onSurface }} />
            <span style={{ height: '7px', background: scheme.onSurface }} />
            <span style={{ height: '10px', background: scheme.onSurface }} />
            <span style={{ height: '12px', background: scheme.onSurfaceVariant }} />
          </span>
          <span className="md-preview__status-5g">5G</span>
          <span className="md-preview__battery" style={{ borderColor: scheme.onSurface }}>
            <span
              className="md-preview__battery-level"
              style={{ background: scheme.onSurface, width: '85%' }}
            />
          </span>
        </div>
      </div>

      {/* 2. Top App Bar (M3 Small) */}
      <div
        className="md-preview__appbar"
        style={{
          background: scheme.surfaceContainer,
          color: scheme.onSurface,
          borderColor: scheme.outlineVariant
        }}
      >
        <button type="button" className="md-preview__icon-btn" tabIndex={-1} aria-label="Menu">
          <Menu size={17} />
        </button>
        <span className="md-preview__appbar-title">ToneLab</span>
        <div className="md-preview__appbar-actions">
          <button type="button" className="md-preview__icon-btn" tabIndex={-1} aria-label="Palette">
            <Palette size={15} />
          </button>
          <button type="button" className="md-preview__icon-btn" tabIndex={-1} aria-label="Search">
            <Search size={15} />
          </button>
          <button type="button" className="md-preview__icon-btn" tabIndex={-1} aria-label="More">
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      {/* 3. Main App Screen Body */}
      <div className="md-preview__body">
        {/* Featured Hero Card (Filled M3 Card in primaryContainer) */}
        <div
          className="md-preview__hero-card"
          style={{
            background: scheme.primaryContainer,
            color: scheme.onPrimaryContainer
          }}
        >
          <div className="md-preview__hero-eyebrow">
            <span
              className="md-preview__hero-badge"
              style={
                isExpressive
                  ? { background: scheme.primary, color: scheme.onPrimary }
                  : isDark
                  ? { background: scheme.surfaceContainerHighest, color: scheme.primary }
                  : { background: scheme.primary, color: scheme.onPrimary }
              }
            >
              {isExpressive ? 'EXPRESSIVE THEME' : 'MONET THEME'}
            </span>
          </div>
          <h4 className="md-preview__hero-title">
            {isExpressive ? 'Harmonic Accents Active' : 'Dynamic Color Active'}
          </h4>
          <p className="md-preview__hero-text" style={{ opacity: 0.88 }}>
            {isExpressive
              ? 'Multi-role color hierarchy with expressive container separation.'
              : 'System surfaces and interactive components adapt seamlessly to your extracted palette.'}
          </p>
          <div className="md-preview__chips-row">
            <span
              className="md-preview__chip md-preview__chip--active"
              style={
                isExpressive
                  ? { background: scheme.primary, color: scheme.onPrimary }
                  : isDark
                  ? { background: scheme.surfaceContainerHighest, color: scheme.primary }
                  : { background: scheme.primary, color: scheme.onPrimary }
              }
            >
              <Check size={11} strokeWidth={3} />
              <span>Applied</span>
            </span>
            <span
              className="md-preview__chip"
              style={
                isExpressive
                  ? { background: scheme.secondaryContainer, color: scheme.onSecondaryContainer, borderColor: 'transparent' }
                  : {
                      background: scheme.surface,
                      color: scheme.onSurface,
                      borderColor: scheme.outlineVariant
                    }
              }
            >
              <span>Roles</span>
            </span>
            <span
              className="md-preview__chip"
              style={
                isExpressive
                  ? { background: scheme.tertiaryContainer, color: scheme.onTertiaryContainer, borderColor: 'transparent' }
                  : {
                      background: scheme.surface,
                      color: scheme.onSurface,
                      borderColor: scheme.outlineVariant
                    }
              }
            >
              <span>WCAG AAA</span>
            </span>
          </div>
        </div>

        {/* Tonal Interactive Card with M3 Switch (Outlined Card) */}
        <div
          className="md-preview__card"
          style={{
            background: scheme.surfaceContainer,
            borderColor: scheme.outlineVariant
          }}
        >
          <div
            className="md-preview__avatar"
            style={
              isExpressive
                ? { background: scheme.secondaryContainer, color: scheme.onSecondaryContainer }
                : isDark
                ? { background: scheme.surfaceContainerHighest, color: scheme.secondary }
                : { background: scheme.secondaryContainer, color: scheme.onSecondaryContainer }
            }
          >
            <Sparkles size={16} />
          </div>
          <div className="md-preview__card-content">
            <span className="md-preview__card-title" style={{ color: scheme.onSurface }}>
              System Theming
            </span>
            <span className="md-preview__card-sub" style={{ color: scheme.onSurfaceVariant }}>
              Harmonize accent surfaces
            </span>
          </div>
          {/* Authentic M3 Switch */}
          <div
            className="md-preview__switch"
            style={{
              background: scheme.primary,
              borderColor: scheme.primary
            }}
          >
            <span
              className="md-preview__switch-thumb"
              style={{
                background: scheme.onPrimary,
                color: scheme.primary
              }}
            >
              <Check size={10} strokeWidth={3} />
            </span>
          </div>
        </div>

        {/* Tonal Metrics / Progress Card */}
        <div
          className="md-preview__card md-preview__card--column"
          style={{
            background: scheme.surfaceContainerLow,
            borderColor: scheme.outlineVariant
          }}
        >
          <div className="md-preview__metric-header">
            <span className="md-preview__metric-title" style={{ color: scheme.onSurface }}>
              Palette Cohesion
            </span>
            <span
              className="md-preview__metric-badge"
              style={
                isExpressive
                  ? { background: scheme.tertiaryContainer, color: scheme.onTertiaryContainer }
                  : isDark
                  ? { background: scheme.surfaceContainerHighest, color: scheme.onSurfaceVariant }
                  : { background: scheme.tertiaryContainer, color: scheme.onTertiaryContainer }
              }
            >
              96% Optimal
            </span>
          </div>
          {/* M3 Linear Progress Bar */}
          <div
            className="md-preview__progress-track"
            style={{ background: scheme.surfaceContainerHighest }}
          >
            <div
              className="md-preview__progress-bar"
              style={{
                background: isExpressive ? scheme.tertiary : scheme.secondary,
                width: '84%'
              }}
            />
          </div>
          {/* Swatches strip previewing 4 roles */}
          <div className="md-preview__swatches-strip">
            {[
              { label: 'Primary', color: scheme.primary },
              { label: 'Secondary', color: scheme.secondary },
              { label: 'Tertiary', color: scheme.tertiary },
              { label: 'Error', color: scheme.error }
            ].map((role) => (
              <span
                key={role.label}
                className="md-preview__swatch-dot"
                style={{ background: role.color }}
                title={role.label}
              />
            ))}
            <span className="md-preview__swatches-note" style={{ color: scheme.onSurfaceVariant }}>
              Harmonized tonal range
            </span>
          </div>
        </div>

        {/* M3 List Item with Shield Check */}
        <div
          className="md-preview__card"
          style={{
            background: scheme.surfaceContainer,
            borderColor: scheme.outlineVariant
          }}
        >
          <div
            className="md-preview__avatar"
            style={
              isExpressive
                ? { background: scheme.tertiaryContainer, color: scheme.onTertiaryContainer }
                : isDark
                ? { background: scheme.surfaceContainerHighest, color: scheme.onSurfaceVariant }
                : { background: scheme.tertiaryContainer, color: scheme.onTertiaryContainer }
            }
          >
            <ShieldCheck size={16} />
          </div>
          <div className="md-preview__card-content">
            <span className="md-preview__card-title" style={{ color: scheme.onSurface }}>
              Accessibility Guard
            </span>
            <span className="md-preview__card-sub" style={{ color: scheme.onSurfaceVariant }}>
              Compliant contrast ratios
            </span>
          </div>
          <span
            className="md-preview__badge-pill"
            style={
              isExpressive
                ? { background: scheme.primaryContainer, color: scheme.onPrimaryContainer }
                : isDark
                ? { background: scheme.surfaceContainerHighest, color: scheme.onSurface }
                : { background: scheme.primaryContainer, color: scheme.onPrimaryContainer }
            }
          >
            7.4:1
          </span>
        </div>
      </div>

      {/* 4. Floating Action Button (M3 FAB) */}
      <button
        type="button"
        className="md-preview__fab"
        style={
          isExpressive
            ? { background: scheme.primary, color: scheme.onPrimary }
            : isDark
            ? { background: scheme.surfaceContainerHighest, color: scheme.primary }
            : { background: scheme.primaryContainer, color: scheme.onPrimaryContainer }
        }
        aria-label="Add or Customize"
        tabIndex={-1}
      >
        <Plus size={22} strokeWidth={2.4} />
      </button>

      {/* 5. Navigation Bar (M3 Standard) */}
      <nav
        className="md-preview__navbar"
        style={{
          background: scheme.surfaceContainer,
          borderColor: scheme.outlineVariant
        }}
      >
        {NAV_TABS.map(({ icon: Icon, label, active }) => (
          <div key={label} className="md-preview__navitem">
            <span
              className="md-preview__navitem-pill"
              style={
                active
                  ? isExpressive
                    ? { background: scheme.secondaryContainer, color: scheme.onSecondaryContainer }
                    : isDark
                    ? { background: scheme.surfaceContainerHighest, color: scheme.primary }
                    : { background: scheme.secondaryContainer, color: scheme.onSecondaryContainer }
                  : { color: scheme.onSurfaceVariant }
              }
            >
              <Icon size={16} strokeWidth={active ? 2.4 : 2} />
            </span>
            <span
              className="md-preview__navitem-label"
              style={{
                color: active ? scheme.onSurface : scheme.onSurfaceVariant,
                fontWeight: active ? 600 : 500
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </nav>

      {/* 6. Gesture Bar */}
      <div className="md-preview__gesture-bar" style={{ background: scheme.onSurfaceVariant }} />
    </div>
  );
}

export default memo(MaterialAndroidPreview);

export function materialAndroidPreviewTextColor(scheme) {
  return getContrastTextColor(scheme.background || scheme.surface);
}
