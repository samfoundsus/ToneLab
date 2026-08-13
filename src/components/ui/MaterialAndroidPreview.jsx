import { memo } from 'react';
import { Menu, Search, MoreVertical, Plus, Home, Bell, User } from 'lucide-react';
import { getContrastTextColor } from '../../utils/colorUtils';
import './MaterialAndroidPreview.css';

const LIST_ITEMS = [
  { titleWidth: '62%', roleFill: 'primary', roleOn: 'onPrimary' },
  { titleWidth: '48%', roleFill: 'secondary', roleOn: 'onSecondary' },
  { titleWidth: '70%', roleFill: 'tertiary', roleOn: 'onTertiary' }
];

const NAV_ITEMS = [
  { icon: Home, label: 'Home', active: true },
  { icon: Search, label: 'Search', active: false },
  { icon: Bell, label: 'Alerts', active: false },
  { icon: User, label: 'You', active: false }
];

/**
 * V3: a third phone preview — a generic Material 3 *app* screen (app bar,
 * list cards, FAB, navigation bar) rather than another home screen, so it
 * shows the palette applied to actual UI components instead of just icon
 * chips. Deliberately built as plain DOM + inline styles instead of a
 * canvas mockup: it updates on every scheme change via normal React
 * reconciliation, with no redraw/regeneration step at all — the cheapest
 * possible way to keep a third live preview in sync.
 */
function MaterialAndroidPreview({ scheme }) {
  return (
    <div
      className="md-preview"
      style={{ background: scheme.background, color: scheme.onBackground }}
      aria-hidden="true"
    >
      <div className="md-preview__statusbar" style={{ color: scheme.onBackground }}>
        <span>9:41</span>
        <span>5G 100%</span>
      </div>

      <div
        className="md-preview__appbar"
        style={{ background: scheme.surface, color: scheme.onSurface }}
      >
        <Menu size={16} />
        <span className="md-preview__appbar-title">Material You</span>
        <Search size={15} />
        <MoreVertical size={15} />
      </div>

      <div className="md-preview__list">
        {LIST_ITEMS.map((item, i) => (
          <div
            key={i}
            className="md-preview__card"
            style={{ background: scheme.surfaceContainer, borderColor: scheme.outlineVariant }}
          >
            <span
              className="md-preview__card-icon"
              style={{ background: scheme[item.roleFill], color: scheme[item.roleOn] }}
            />
            <div className="md-preview__card-lines">
              <span
                className="md-preview__card-line"
                style={{ background: scheme.onSurface, width: item.titleWidth }}
              />
              <span
                className="md-preview__card-line md-preview__card-line--sub"
                style={{ background: scheme.onSurfaceVariant }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="md-preview__fab"
        style={{ background: scheme.primaryContainer, color: scheme.onPrimaryContainer }}
        aria-label="Add"
        tabIndex={-1}
      >
        <Plus size={20} />
      </button>

      <nav
        className="md-preview__navbar"
        style={{ background: scheme.surfaceContainer, borderColor: scheme.outlineVariant }}
      >
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <div key={label} className="md-preview__navitem">
            <span
              className="md-preview__navitem-pill"
              style={
                active
                  ? { background: scheme.secondaryContainer, color: scheme.onSecondaryContainer }
                  : { color: scheme.onSurfaceVariant }
              }
            >
              <Icon size={16} />
            </span>
            <span
              className="md-preview__navitem-label"
              style={{ color: active ? scheme.onSurface : scheme.onSurfaceVariant }}
            >
              {label}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}

export default memo(MaterialAndroidPreview);

// Exported for the phone "stage" caption color, which needs to know
// whether this preview's own background reads light or dark, independent
// of the surrounding page theme.
export function materialAndroidPreviewTextColor(scheme) {
  return getContrastTextColor(scheme.background);
}
