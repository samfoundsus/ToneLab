// Color math utilities: RGB <-> HSL <-> HEX, luminance/contrast helpers,
// and a lightweight dominant-color extractor used to seed Material palettes.

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const int = parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

export function rgbToHex({ r, g, b }) {
  const toHex = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }) {
  const hn = ((h % 360) + 360) % 360 / 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;

  if (sn === 0) {
    const v = ln * 255;
    return { r: v, g: v, b: v };
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  return {
    r: hue2rgb(hn + 1 / 3) * 255,
    g: hue2rgb(hn) * 255,
    b: hue2rgb(hn - 1 / 3) * 255
  };
}

export function hslToHex(h, s, l) {
  return rgbToHex(hslToRgb({ h, s, l }));
}

export function hexToHsl(hex) {
  return rgbToHsl(hexToRgb(hex));
}

// Relative luminance (WCAG) — used to decide black/white text on a swatch.
export function getRelativeLuminance({ r, g, b }) {
  const chan = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * chan[0] + 0.7152 * chan[1] + 0.0722 * chan[2];
}

export function getContrastTextColor(hex) {
  const luminance = getRelativeLuminance(hexToRgb(hex));
  return luminance > 0.42 ? '#1B1B1F' : '#FFFFFF';
}

/** WCAG contrast ratio between two colors, from 1 (identical) to 21 (black/white). */
export function contrastRatio(hexA, hexB) {
  const lA = getRelativeLuminance(hexToRgb(hexA)) + 0.05;
  const lB = getRelativeLuminance(hexToRgb(hexB)) + 0.05;
  return lA > lB ? lA / lB : lB / lA;
}

/** Classifies a contrast ratio against the standard WCAG 2.x text thresholds. */
export function wcagLevel(ratio) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-LARGE';
  return 'FAIL';
}

// ---------- V2: manual color-editing helpers ----------

const HEX6_RE = /^#?[0-9a-fA-F]{6}$/;

/** True if `value` is a well-formed 6-digit hex color (with or without '#'). */
export function isValidHex(value) {
  return typeof value === 'string' && HEX6_RE.test(value.trim());
}

/** Normalizes any valid hex input to `#RRGGBB` (uppercase). Returns null if invalid. */
export function normalizeHex(value) {
  if (!isValidHex(value)) return null;
  const clean = value.trim().replace('#', '');
  return `#${clean.toUpperCase()}`;
}

/** Lowercase `#rrggbb` form required by native <input type="color">. */
export function toNativeColorInputValue(hex) {
  const normalized = normalizeHex(hex) || '#000000';
  return normalized.toLowerCase();
}

/**
 * Shared bucketing pass used by both `extractSeedColor` and
 * `extractPaletteSeeds`: downsamples the image onto a small canvas and
 * quantizes pixels into coarse RGB buckets. Returns `null` if the canvas is
 * tainted (cross-origin without CORS) rather than throwing.
 */
function computeColorBuckets(imgEl, sampleSize) {
  const canvas = document.createElement('canvas');
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(imgEl, 0, 0, sampleSize, sampleSize);

  let data;
  try {
    data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
  } catch (err) {
    return null;
  }

  const buckets = new Map();
  const BUCKET = 24; // quantization step per channel

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 200) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${Math.round(r / BUCKET)}_${Math.round(g / BUCKET)}_${Math.round(b / BUCKET)}`;
    const entry = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0 };
    entry.r += r;
    entry.g += g;
    entry.b += b;
    entry.count += 1;
    buckets.set(key, entry);
  }

  return buckets;
}

const DEFAULT_SEED_COLOR = { hex: '#8AB4F8', h: 217, s: 89, l: 76 };

/** Scores a bucket by population, saturation and mid-range lightness, and
 *  returns it alongside its averaged RGB/HSL so candidates can be compared
 *  and ranked without re-deriving HSL repeatedly. */
function scoreBucket(entry) {
  const avg = { r: entry.r / entry.count, g: entry.g / entry.count, b: entry.b / entry.count };
  const { h, s, l } = rgbToHsl(avg);
  const lightnessScore = 1 - Math.abs(l - 55) / 55;
  const score = entry.count * (0.35 + s / 100) * (0.4 + lightnessScore);
  return { avg, h, s, l, score };
}

function seedFromCandidate(candidate) {
  // Keep saturation lively even on muted photos, and pin lightness to a
  // usable mid-range so it makes a good "source color" for tonal palettes.
  const s = clamp(Math.max(candidate.s, 38), 0, 90);
  const l = clamp(candidate.l, 30, 60);
  return { hex: hslToHex(candidate.h, s, l), h: candidate.h, s, l };
}

function hueDistance(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Extracts a vibrant, representative "seed" color from an <img> element by
 * downsampling it onto a small canvas, quantizing pixels into coarse RGB
 * buckets, and scoring buckets by a mix of population, saturation and
 * mid-range lightness (so we don't pick near-black/near-white backgrounds).
 */
export function extractSeedColor(imgEl, sampleSize = 64) {
  const buckets = computeColorBuckets(imgEl, sampleSize);
  if (!buckets) return DEFAULT_SEED_COLOR;

  let best = null;
  buckets.forEach((entry) => {
    const candidate = scoreBucket(entry);
    if (!best || candidate.score > best.score) best = candidate;
  });

  if (!best) return DEFAULT_SEED_COLOR;
  return seedFromCandidate(best);
}

/**
 * V3: richer wallpaper analysis built on the same bucket pass as
 * `extractSeedColor` (no second image scan) — additionally looks for a
 * genuine *accent* color: the best-scoring bucket whose hue is meaningfully
 * different (>=40°) from the dominant color, so the generated Tertiary role
 * can be anchored to something that's actually in the wallpaper instead of
 * always being a fixed +60° hue rotation. Falls back to `accent: null` on
 * monochromatic/duotone images, where the existing algorithmic offset is
 * the more sensible choice anyway.
 */
export function extractPaletteSeeds(imgEl, sampleSize = 64) {
  const buckets = computeColorBuckets(imgEl, sampleSize);
  if (!buckets) return { primary: DEFAULT_SEED_COLOR, accent: null };

  const scored = [];
  buckets.forEach((entry) => scored.push(scoreBucket(entry)));
  scored.sort((a, b) => b.score - a.score);

  if (!scored.length) return { primary: DEFAULT_SEED_COLOR, accent: null };

  const top = scored[0];
  const primary = seedFromCandidate(top);

  const accentCandidate = scored.find(
    (c) => hueDistance(c.h, top.h) >= 40 && c.score >= top.score * 0.12
  );
  const accent = accentCandidate ? seedFromCandidate(accentCandidate) : null;

  return { primary, accent };
}
