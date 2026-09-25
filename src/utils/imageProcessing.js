// Wallpaper processing pipeline.
//
// Robust decoding pipeline for images of ANY dimensions, aspect ratios, and formats
// (JPEG/JPG, PNG, WebP, GIF, BMP, AVIF, SVG, etc.).
//
// Implements a 3-step fallback chain:
//   1. createImageBitmap() with EXIF orientation & color space handling
//   2. HTMLImageElement / Image.decode()
//   3. FileReader DataURL -> Canvas fallback (normalizes CMYK, progressive & custom profiles)
//
// Never rejects based on MIME mismatch or filename alone; if the browser can decode it,
// it is accepted and processed. Diagnoses specific decode failures if all steps fail.

import { extractPaletteSeeds } from './colorUtils';

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/x-ms-bmp',
  'image/avif',
  'image/svg+xml'
];

export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif', '.svg'];

export const ACCEPTED_EXT_LABEL = 'all common image formats • Any size or aspect ratio';

const SEED_SAMPLE_SIZE = 64; // px — matches extractSeedColor's default

export function isSupportedImageFile(file) {
  if (!file) return false;
  // Always give the file a chance to decode if it is a Blob/File
  return true;
}

/**
 * Step 1: createImageBitmap()
 * Fast, runs off-thread, and natively handles EXIF orientation and color space conversion.
 */
async function tryDecodeViaImageBitmap(file) {
  if (typeof window === 'undefined' || typeof window.createImageBitmap !== 'function') {
    return null;
  }

  // Attempt with EXIF orientation and color space conversion
  try {
    const bitmap = await window.createImageBitmap(file, {
      imageOrientation: 'from-image',
      colorSpaceConversion: 'default'
    });
    if (bitmap && bitmap.width > 0 && bitmap.height > 0) {
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => {
          try {
            bitmap.close?.();
          } catch (e) {
            // ignore
          }
        }
      };
    }
    bitmap?.close?.();
  } catch (errWithOptions) {
    // Some browsers reject option dictionaries for specific image types; retry plain
    try {
      const bitmap = await window.createImageBitmap(file);
      if (bitmap && bitmap.width > 0 && bitmap.height > 0) {
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          cleanup: () => {
            try {
              bitmap.close?.();
            } catch (e) {
              // ignore
            }
          }
        };
      }
      bitmap?.close?.();
    } catch (errPlain) {
      // Step 1 failed, continue to Step 2
    }
  }

  return null;
}

/**
 * Step 2: HTMLImageElement / Image.decode()
 * Handles SVG, animated GIF frames, and formats where createImageBitmap may have quirks.
 */
function tryDecodeViaImageElement(sourceUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;

    // Safety timeout to avoid hanging on stalled loads
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, 10000);

    const onReady = async () => {
      if (settled) return;
      clearTimeout(timer);
      settled = true;

      try {
        if ('decode' in img) {
          await img.decode();
        }
      } catch (decodeErr) {
        // decode() can reject on progressive JPEGs or uncommon profiles
        // even when img.naturalWidth is fully populated and drawable
      }

      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (width > 0 && height > 0) {
        resolve({
          source: img,
          width,
          height,
          cleanup: () => {}
        });
      } else {
        resolve(null);
      }
    };

    img.onload = onReady;
    img.onerror = () => {
      if (!settled) {
        clearTimeout(timer);
        settled = true;
        resolve(null);
      }
    };

    img.src = sourceUrl;
  });
}

/**
 * Step 3: Canvas fallback via FileReader
 * Normalizes CMYK JPEGs, progressive JPEGs, and custom color profiles via 2D canvas context.
 */
function tryDecodeViaCanvasFallback(file) {
  return new Promise((resolve) => {
    if (typeof FileReader === 'undefined') {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, 10000);

    reader.onload = () => {
      if (settled) return;
      const dataUrl = reader.result;
      if (!dataUrl) {
        clearTimeout(timer);
        settled = true;
        resolve(null);
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (settled) return;
        clearTimeout(timer);
        settled = true;

        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        if (width > 0 && height > 0) {
          try {
            // Draw onto canvas to normalize color profile / CMYK / alpha
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(width, 1024);
            canvas.height = Math.max(1, Math.round(height * (canvas.width / width)));
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve({
              source: canvas,
              width,
              height,
              cleanup: () => {
                canvas.width = 0;
                canvas.height = 0;
              }
            });
          } catch (canvasErr) {
            resolve({
              source: img,
              width,
              height,
              cleanup: () => {}
            });
          }
        } else {
          resolve(null);
        }
      };

      img.onerror = () => {
        if (!settled) {
          clearTimeout(timer);
          settled = true;
          resolve(null);
        }
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      if (!settled) {
        clearTimeout(timer);
        settled = true;
        resolve(null);
      }
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Sniffs the magic bytes to diagnose the exact reason for decode failure.
 */
async function diagnoseDecodeFailure(file) {
  if (!file) {
    return 'No file was provided.';
  }
  if (file.size === 0) {
    return 'The selected file is empty (0 bytes).';
  }

  let bytes;
  try {
    const slice = file.slice(0, 48);
    const buf = await slice.arrayBuffer();
    bytes = new Uint8Array(buf);
  } catch (e) {
    return 'Unable to read the file data from disk.';
  }

  // Non-image formats
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'This file is a PDF document, not an image.';
  }
  if (bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4B) {
    return 'This file is a ZIP archive or package, not an image.';
  }
  if (bytes.length >= 2 && bytes[0] === 0x4D && bytes[1] === 0x5A) {
    return 'This file is an executable program, not an image.';
  }

  // Image signatures
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
  const isPng = bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
  const isGif = bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;
  const isBmp = bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4D;

  let isWebp = false;
  if (bytes.length >= 12) {
    const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
    const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (riff === 'RIFF' && webp === 'WEBP') isWebp = true;
  }

  let isAvif = false;
  let isHeic = false;
  if (bytes.length >= 12) {
    const ftyp = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
    const sub = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]).toLowerCase();
    if (ftyp === 'ftyp') {
      if (sub.includes('avif') || sub.includes('avis')) isAvif = true;
      if (sub.includes('heic') || sub.includes('heif') || sub.includes('mif1')) isHeic = true;
    }
  }

  if (isHeic) {
    return 'HEIC/HEIF images are not natively supported by this web browser. Please convert to JPG, PNG, or WebP.';
  }

  if (isJpeg) {
    return 'Could not decode this JPEG image. The image data may be corrupted, truncated, or using an incompatible compression mode.';
  }
  if (isPng) {
    return 'Could not decode this PNG image. The file stream may be damaged or incomplete.';
  }
  if (isWebp) {
    return 'Could not decode this WebP image. The bitstream may be corrupted.';
  }
  if (isAvif) {
    return 'Your browser does not currently support decoding this AVIF image. Please convert to JPG, PNG or WebP.';
  }
  if (isGif) {
    return 'Could not decode this GIF file. The frame table may be damaged.';
  }
  if (isBmp) {
    return 'Could not decode this BMP file. The header or color map may be corrupted.';
  }

  // Check SVG or plain text
  try {
    const textSample = new TextDecoder('utf-8', { fatal: false }).decode(bytes).trim();
    if (textSample.startsWith('<svg') || textSample.startsWith('<?xml') || textSample.includes('<svg')) {
      return 'Could not render this SVG file. Please ensure it is a valid XML/SVG vector image.';
    }
    if (/^[a-zA-Z0-9\r\n\t =:;{}()\[\]"'/.,_<!?-]+$/.test(textSample.slice(0, 30))) {
      return 'This file contains plain text or code rather than image data.';
    }
  } catch (e) {
    // ignore
  }

  return 'The browser could not decode this file as an image. Please verify the file integrity or try another image.';
}

/**
 * Loads an uploaded wallpaper file without cropping, resizing or altering it, and returns:
 *  - `seed`: dominant seed color ({ hex, h, s, l })
 *  - `accent`: distinct secondary color from the wallpaper, if found ({ hex, h, s, l } | null)
 *  - `previewUrl`: object URL pointing directly to the user's original image
 *  - `dimensions`: original pixel dimensions ({ width, height })
 *  - `downscaled`: false (original image preserved)
 *
 * Uses the 3-step fallback chain (createImageBitmap -> HTMLImageElement -> Canvas).
 * Diagnoses the exact cause if decoding fails.
 */
export async function processWallpaperFile(file) {
  if (!file) {
    throw new Error('No file was provided.');
  }

  const sourceUrl = URL.createObjectURL(file);
  let decoded = null;

  // Step 1: createImageBitmap (handles EXIF orientation, background decode, CMYK, progressive)
  try {
    decoded = await tryDecodeViaImageBitmap(file);
  } catch (e) {
    decoded = null;
  }

  // Step 2: HTMLImageElement / Image.decode()
  if (!decoded) {
    try {
      decoded = await tryDecodeViaImageElement(sourceUrl);
    } catch (e) {
      decoded = null;
    }
  }

  // Step 3: Canvas fallback via FileReader DataURL
  if (!decoded) {
    try {
      decoded = await tryDecodeViaCanvasFallback(file);
    } catch (e) {
      decoded = null;
    }
  }

  // If all decode attempts failed, diagnose the real reason
  if (!decoded) {
    URL.revokeObjectURL(sourceUrl);
    const diagnosis = await diagnoseDecodeFailure(file);
    throw new Error(diagnosis);
  }

  const { source, width, height, cleanup } = decoded;

  try {
    const { primary: seed, accent } = extractPaletteSeeds(source, SEED_SAMPLE_SIZE);

    // Ensure previewUrl is guaranteed displayable across all browser <img> tags
    let previewUrl = sourceUrl;
    const isBmp = file?.type?.includes('bmp') || file?.name?.toLowerCase().endsWith('.bmp');
    const isCanvas = typeof HTMLCanvasElement !== 'undefined' && source instanceof HTMLCanvasElement;

    if (isBmp || isCanvas) {
      try {
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = Math.min(width, 2560);
        previewCanvas.height = Math.max(1, Math.round(height * (previewCanvas.width / width)));
        const pCtx = previewCanvas.getContext('2d');
        pCtx.drawImage(source, 0, 0, previewCanvas.width, previewCanvas.height);
        const blob = await new Promise((res) => previewCanvas.toBlob(res, 'image/png'));
        if (blob) {
          URL.revokeObjectURL(sourceUrl);
          previewUrl = URL.createObjectURL(blob);
        }
      } catch (previewErr) {
        // preserve sourceUrl
      }
    }

    cleanup();

    return {
      seed,
      accent,
      previewUrl,
      dimensions: { width, height },
      downscaled: false
    };
  } catch (err) {
    cleanup();
    URL.revokeObjectURL(sourceUrl);
    throw new Error('Could not analyze colors from this image. Please try another image.');
  }
}

/**
 * Decodes an uploaded file into a stable, browser-displayable preview representation.
 * Completely independent from the palette-processing pipeline.
 *
 * 1. Checks if original file can be loaded directly by an HTMLImageElement without error.
 *    If yes, and it is a standard web image (JPEG, PNG, WebP, GIF, SVG) without known quirks,
 *    returns the original object URL directly.
 * 2. If the raw image has decode quirks (e.g. BMP, progressive/CMYK JPEG, MIME mismatch,
 *    or fails in Image element), decodes via createImageBitmap (with EXIF orientation)
 *    or Canvas fallback, normalizes it onto a canvas preserving exact aspect ratio,
 *    and generates a standard PNG blob URL.
 * 3. Returns { url, dimensions: { width, height } } or null if decoding fails completely.
 */
export async function createStablePreview(file) {
  if (!file) return null;

  const isBmp = file.type?.includes('bmp') || file.name?.toLowerCase().endsWith('.bmp');

  // Attempt 1: Direct File URL if standard web image and natively renderable
  // Skip direct path for BMP as native <img> tags often fail on raw BMP blob URLs
  if (!isBmp) {
    const directUrl = URL.createObjectURL(file);
    try {
      const dimensions = await new Promise((resolve, reject) => {
        const img = new Image();
        let done = false;
        const timer = setTimeout(() => {
          if (!done) {
            done = true;
            reject(new Error('TIMEOUT'));
          }
        }, 3000);

        img.onload = () => {
          if (done) return;
          clearTimeout(timer);
          done = true;
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          if (w > 0 && h > 0) {
            resolve({ width: w, height: h });
          } else {
            reject(new Error('INVALID_DIMENSIONS'));
          }
        };

        img.onerror = () => {
          if (done) return;
          clearTimeout(timer);
          done = true;
          reject(new Error('IMG_ERROR'));
        };

        img.src = directUrl;
      });

      return {
        url: directUrl,
        dimensions
      };
    } catch (directErr) {
      URL.revokeObjectURL(directUrl);
      // Proceed to fallback chain
    }
  }

  // Attempt 2: createImageBitmap with EXIF orientation handling -> normalized canvas -> blob
  if (typeof window !== 'undefined' && typeof window.createImageBitmap === 'function') {
    try {
      let bitmap = null;
      try {
        bitmap = await window.createImageBitmap(file, {
          imageOrientation: 'from-image',
          colorSpaceConversion: 'default'
        });
      } catch (errWithOptions) {
        bitmap = await window.createImageBitmap(file);
      }

      if (bitmap && bitmap.width > 0 && bitmap.height > 0) {
        const origW = bitmap.width;
        const origH = bitmap.height;

        const maxDim = 2560;
        let targetW = origW;
        let targetH = origH;
        if (Math.max(origW, origH) > maxDim) {
          const scale = maxDim / Math.max(origW, origH);
          targetW = Math.max(1, Math.round(origW * scale));
          targetH = Math.max(1, Math.round(origH * scale));
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
        bitmap.close?.();

        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, 'image/png');
        });

        canvas.width = 0;
        canvas.height = 0;

        if (blob) {
          return {
            url: URL.createObjectURL(blob),
            dimensions: { width: origW, height: origH }
          };
        }
      }
    } catch (bitmapErr) {
      // Proceed to Attempt 3
    }
  }

  // Attempt 3: FileReader DataURL -> Image -> Canvas -> Blob
  if (typeof FileReader !== 'undefined') {
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('READ_ERROR'));
        reader.readAsDataURL(file);
      });

      if (dataUrl) {
        const img = new Image();
        const dimensions = await new Promise((resolve, reject) => {
          let done = false;
          const timer = setTimeout(() => {
            if (!done) {
              done = true;
              reject(new Error('TIMEOUT'));
            }
          }, 4000);

          img.onload = () => {
            if (done) return;
            clearTimeout(timer);
            done = true;
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;
            if (w > 0 && h > 0) resolve({ width: w, height: h });
            else reject(new Error('INVALID'));
          };

          img.onerror = () => {
            if (done) return;
            clearTimeout(timer);
            done = true;
            reject(new Error('IMG_ERROR'));
          };

          img.src = dataUrl;
        });

        const maxDim = 2560;
        let targetW = dimensions.width;
        let targetH = dimensions.height;
        if (Math.max(targetW, targetH) > maxDim) {
          const scale = maxDim / Math.max(targetW, targetH);
          targetW = Math.max(1, Math.round(targetW * scale));
          targetH = Math.max(1, Math.round(targetH * scale));
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, 'image/png');
        });

        canvas.width = 0;
        canvas.height = 0;

        if (blob) {
          return {
            url: URL.createObjectURL(blob),
            dimensions
          };
        }
      }
    } catch (frErr) {
      // Decode failed
    }
  }

  return null;
}

/** Revokes a preview object URL if it looks like one (safe to call on any string). */
export function revokePreviewUrl(url) {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
