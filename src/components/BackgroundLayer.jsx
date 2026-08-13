import { memo } from 'react';
import './BackgroundLayer.css';

/**
 * A quiet backdrop used inside a handful of open, breathing-room sections
 * (Hero, Preview, Themes). It is NOT a page-wide overlay — it lives inside a
 * `position: relative; overflow: hidden` section and sits behind that
 * section's own content, so it only ever shows in the natural whitespace
 * around cards rather than fighting for attention.
 *
 * Two or three large, soft, low-opacity tonal shapes derived from the
 * current Material palette (via CSS variables) — nothing here animates on
 * its own. The only motion is the smooth color transition when the palette
 * changes.
 *
 * V2.1: wrapped in React.memo. Its only props are two short strings, so a
 * parent re-rendering for unrelated reasons (e.g. PhonePreview redrawing its
 * canvases after a color edit) no longer causes this to re-render too.
 */
function BackgroundLayer({ themeMode = 'dark', variant = 'default' }) {
  return (
    <div className={`bg-layer bg-layer--${themeMode} bg-layer--${variant}`} aria-hidden="true">
      <span className="bg-layer__shape bg-layer__shape--a" />
      <span className="bg-layer__shape bg-layer__shape--b" />
      <span className="bg-layer__shape bg-layer__shape--c" />
    </div>
  );
}

export default memo(BackgroundLayer);
