// Wallpaper processing pipeline.
//
// Goals (V2 spec §5/§14, V2.1 spec §3): keep palette quality similar while
// cutting memory use and main-thread work for large uploads.
//
//   original file
//     -> decode once via an object URL (no giant base64 string)
//     -> if the image is larger than a sane display size, downscale it a
//        single time into an intermediate canvas
//     -> sample the seed color FROM THAT SAME (already small) canvas
//        instead of re-touching the full-resolution bitmap a second time
//     -> re-use the same canvas to produce the on-screen preview blob
//     -> release every temporary object URL / canvas as soon as it's no
//        longer needed
//
// The user's original file is never mutated — we only ever produce an
// additional, smaller *preview* copy when the source is unusually large,
// and the seed color is extracted once, from the smallest source available.

import { extractPaletteSeeds } from './colorUtils';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_EXT_LABEL = 'JPG, PNG, JPEG, WEBP';

const MAX_PREVIEW_DIMENSION = 1600;
const PREVIEW_JPEG_QUALITY = 0.86;
const MAX_FILE_SIZE_BYTES = 45 * 1024 * 1024; // 45MB safety cap
const SEED_SAMPLE_SIZE = 64; // px — matches extractSeedColor's default

export function isSupportedImageFile(file) {
  return !!file && ACCEPTED_IMAGE_TYPES.includes(file.type);
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('DECODE_FAILED'));
    img.src = src;
  });
}

/**
 * Loads an uploaded wallpaper file and returns:
 *  - `seed`: the extracted dominant seed color ({ hex, h, s, l })
 *  - `accent`: a genuinely distinct second color from the wallpaper, if one
 *    was found ({ hex, h, s, l } | null) — see `extractPaletteSeeds`
 *  - `previewUrl`: an object URL sized for on-screen display
 *  - `dimensions`: the original pixel dimensions
 *  - `downscaled`: whether a smaller preview copy was generated
 *
 * Throws an Error with a short `message` code (`UNSUPPORTED_FORMAT`,
 * `FILE_TOO_LARGE`, `DECODE_FAILED`) that callers can map to friendly text.
 */
export async function processWallpaperFile(file) {
  if (!isSupportedImageFile(file)) {
    throw new Error('UNSUPPORTED_FORMAT');
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('FILE_TOO_LARGE');
  }

  const sourceUrl = URL.createObjectURL(file);
  let sourceImg;
  try {
    sourceImg = await loadImageElement(sourceUrl);
  } catch (err) {
    URL.revokeObjectURL(sourceUrl);
    throw new Error('DECODE_FAILED');
  }

  const width = sourceImg.naturalWidth || sourceImg.width;
  const height = sourceImg.naturalHeight || sourceImg.height;
  const longEdge = Math.max(width, height);

  // Already a reasonable size — sample the seed color directly and reuse
  // the same object URL for preview, no re-encoding work.
  if (!longEdge || longEdge <= MAX_PREVIEW_DIMENSION) {
    const { primary: seed, accent } = extractPaletteSeeds(sourceImg, SEED_SAMPLE_SIZE);
    return { seed, accent, previewUrl: sourceUrl, dimensions: { width, height }, downscaled: false };
  }

  // Large image: downscale ONCE into an intermediate canvas, then reuse
  // that same (already small) canvas for both the seed sample and the
  // preview blob, instead of touching the full-resolution bitmap twice.
  const scale = MAX_PREVIEW_DIMENSION / longEdge;
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(sourceImg, 0, 0, targetW, targetH);

  // Cheap canvas-to-canvas sample — extractPaletteSeeds accepts any
  // CanvasImageSource, so no changes needed there. Looks for both the
  // dominant color and (when present) a genuinely distinct accent color,
  // in the same single bucket pass.
  const { primary: seed, accent } = extractPaletteSeeds(canvas, SEED_SAMPLE_SIZE);

  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', PREVIEW_JPEG_QUALITY);
  });

  // The full-resolution object URL and the intermediate canvas have both
  // served their purpose — release them right away.
  URL.revokeObjectURL(sourceUrl);
  canvas.width = 0;
  canvas.height = 0;

  if (!blob) {
    // Downscale failed for some reason — fall back to a fresh full-res URL
    // rather than losing the upload. The seed color was already sampled
    // successfully above, so palette generation is unaffected.
    const fallbackUrl = URL.createObjectURL(file);
    return { seed, accent, previewUrl: fallbackUrl, dimensions: { width, height }, downscaled: false };
  }

  const previewUrl = URL.createObjectURL(blob);
  return { seed, accent, previewUrl, dimensions: { width, height }, downscaled: true };
}

/** Revokes a preview object URL if it looks like one (safe to call on any string). */
export function revokePreviewUrl(url) {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
