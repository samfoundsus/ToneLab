import { memo } from 'react';

/**
 * Visual Foundation Pass: Large glowing blobs and radial-gradient layers
 * have been removed in favor of clean, flat Material tonal surfaces.
 * Component is kept as a memoized no-op to maintain full API compatibility.
 */
function BackgroundLayer() {
  return null;
}

export default memo(BackgroundLayer);

