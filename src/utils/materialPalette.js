import { hslToHex, clamp } from './colorUtils';

// A compact re-implementation of the *shape* of Material Design 3's
// tonal-palette + color-role system, built on HSL rather than the full HCT
// color space. It takes a "source color" and derives Primary / Secondary /
// Tertiary / Neutral / Neutral-Variant / Error tonal palettes, then maps
// tones onto the standard M3 color roles for light, dark and an "expressive"
// higher-chroma variant.
//
// V2 tonal-consistency pass: HSL is perceptually non-uniform — yellow/green
// hues read as far more intense than blue/violet hues at the same
// saturation and lightness, which is what makes naively-generated palettes
// occasionally look "neon" in that band. `perceptualSaturation` applies a
// gentle, hue-aware correction so tones stay usable across the whole hue
// wheel, and the primary saturation ceiling was tightened slightly for the
// same reason. The tone/role mapping itself (which is the part that keeps
// On-Color / Container pairs readable) is unchanged from V1.

function perceptualSaturation(hue, sat) {
  const h = ((hue % 360) + 360) % 360;
  const bandCenter = 105; // yellow-green
  const bandHalfWidth = 70;
  const distance = Math.abs(((h - bandCenter + 540) % 360) - 180);
  if (distance > bandHalfWidth) return sat;
  const t = 1 - distance / bandHalfWidth;
  const falloff = 0.5 - 0.5 * Math.cos(t * Math.PI); // smooth 0..1, peaks at band center
  const maxReduction = 0.32;
  return sat * (1 - falloff * maxReduction);
}

const tone = (hue, sat, l) => hslToHex(hue, clamp(perceptualSaturation(hue, sat), 0, 100), clamp(l, 0, 100));

function buildTonalRamps(sourceH, sourceS, accentHue) {
  const primaryS = clamp(sourceS, 34, 72);
  const secondaryS = clamp(sourceS * 0.42, 14, 36);
  const tertiaryS = clamp(sourceS * 0.62, 20, 52);
  const neutralS = clamp(sourceS * 0.08, 4, 10);
  const neutralVariantS = clamp(sourceS * 0.16, 8, 18);
  // V3: when the wallpaper analysis found a genuine second accent color,
  // anchor Tertiary to its actual hue instead of a fixed +60° rotation.
  const tertiaryHue = accentHue ?? sourceH + 60;

  return {
    primary: (l) => tone(sourceH, primaryS, l),
    secondary: (l) => tone(sourceH, secondaryS, l),
    tertiary: (l) => tone(tertiaryHue, tertiaryS, l),
    neutral: (l) => tone(sourceH, neutralS, l),
    neutralVariant: (l) => tone(sourceH, neutralVariantS, l),
    error: (l) => tone(25, 78, l)
  };
}

function buildExpressiveRamps(sourceH, sourceS, accentHue) {
  const primaryS = clamp(sourceS + 14, 55, 90);
  const secondaryS = clamp(sourceS * 0.6, 30, 60);
  const tertiaryS = clamp(sourceS * 0.85, 45, 88);
  const neutralS = clamp(sourceS * 0.1, 6, 14);
  const neutralVariantS = clamp(sourceS * 0.22, 12, 24);
  const tertiaryHue = accentHue ?? sourceH - 50;

  return {
    primary: (l) => tone(sourceH, primaryS, l),
    secondary: (l) => tone(sourceH + 24, secondaryS, l),
    tertiary: (l) => tone(tertiaryHue, tertiaryS, l),
    neutral: (l) => tone(sourceH, neutralS, l),
    neutralVariant: (l) => tone(sourceH, neutralVariantS, l),
    error: (l) => tone(8, 84, l)
  };
}

function roleSet(ramp, tones) {
  return {
    primary: ramp.primary(tones.primary),
    onPrimary: ramp.primary(tones.onPrimary),
    primaryContainer: ramp.primary(tones.primaryContainer),
    onPrimaryContainer: ramp.primary(tones.onPrimaryContainer),

    secondary: ramp.secondary(tones.secondary),
    onSecondary: ramp.secondary(tones.onSecondary),
    secondaryContainer: ramp.secondary(tones.secondaryContainer),
    onSecondaryContainer: ramp.secondary(tones.onSecondaryContainer),

    tertiary: ramp.tertiary(tones.tertiary),
    onTertiary: ramp.tertiary(tones.onTertiary),
    tertiaryContainer: ramp.tertiary(tones.tertiaryContainer),
    onTertiaryContainer: ramp.tertiary(tones.onTertiaryContainer),

    error: ramp.error(tones.error),
    onError: ramp.error(tones.onError),
    errorContainer: ramp.error(tones.errorContainer),
    onErrorContainer: ramp.error(tones.onErrorContainer),

    background: ramp.neutral(tones.background),
    onBackground: ramp.neutral(tones.onBackground),

    surface: ramp.neutral(tones.surface),
    onSurface: ramp.neutral(tones.onSurface),
    surfaceVariant: ramp.neutralVariant(tones.surfaceVariant),
    onSurfaceVariant: ramp.neutralVariant(tones.onSurfaceVariant),
    surfaceTint: ramp.primary(tones.primary),

    outline: ramp.neutralVariant(tones.outline),
    outlineVariant: ramp.neutralVariant(tones.outlineVariant),

    inverseSurface: ramp.neutral(tones.inverseSurface),
    inverseOnSurface: ramp.neutral(tones.inverseOnSurface),
    inversePrimary: ramp.primary(tones.inversePrimary),

    shadow: ramp.neutral(0),
    scrim: ramp.neutral(0),

    surfaceContainerLowest: ramp.neutral(tones.surfaceContainerLowest),
    surfaceContainerLow: ramp.neutral(tones.surfaceContainerLow),
    surfaceContainer: ramp.neutral(tones.surfaceContainer),
    surfaceContainerHigh: ramp.neutral(tones.surfaceContainerHigh),
    surfaceContainerHighest: ramp.neutral(tones.surfaceContainerHighest)
  };
}

const LIGHT_TONES = {
  primary: 40, onPrimary: 100, primaryContainer: 90, onPrimaryContainer: 10,
  secondary: 40, onSecondary: 100, secondaryContainer: 90, onSecondaryContainer: 10,
  tertiary: 40, onTertiary: 100, tertiaryContainer: 90, onTertiaryContainer: 10,
  error: 40, onError: 100, errorContainer: 90, onErrorContainer: 10,
  background: 98, onBackground: 10,
  surface: 98, onSurface: 10, surfaceVariant: 90, onSurfaceVariant: 30,
  outline: 50, outlineVariant: 80,
  inverseSurface: 20, inverseOnSurface: 95, inversePrimary: 80,
  surfaceContainerLowest: 100, surfaceContainerLow: 96, surfaceContainer: 94,
  surfaceContainerHigh: 92, surfaceContainerHighest: 90
};

const DARK_TONES = {
  primary: 80, onPrimary: 20, primaryContainer: 30, onPrimaryContainer: 90,
  secondary: 80, onSecondary: 20, secondaryContainer: 30, onSecondaryContainer: 90,
  tertiary: 80, onTertiary: 20, tertiaryContainer: 30, onTertiaryContainer: 90,
  error: 80, onError: 20, errorContainer: 30, onErrorContainer: 90,
  background: 6, onBackground: 90,
  surface: 6, onSurface: 90, surfaceVariant: 30, onSurfaceVariant: 80,
  outline: 60, outlineVariant: 30,
  inverseSurface: 90, inverseOnSurface: 20, inversePrimary: 40,
  surfaceContainerLowest: 4, surfaceContainerLow: 10, surfaceContainer: 12,
  surfaceContainerHigh: 17, surfaceContainerHighest: 22
};

const EXPRESSIVE_TONES = {
  primary: 45, onPrimary: 100, primaryContainer: 86, onPrimaryContainer: 12,
  secondary: 34, onSecondary: 100, secondaryContainer: 88, onSecondaryContainer: 12,
  tertiary: 38, onTertiary: 100, tertiaryContainer: 85, onTertiaryContainer: 12,
  error: 42, onError: 100, errorContainer: 90, onErrorContainer: 10,
  background: 12, onBackground: 96,
  surface: 10, onSurface: 96, surfaceVariant: 26, onSurfaceVariant: 82,
  outline: 55, outlineVariant: 32,
  inverseSurface: 92, inverseOnSurface: 16, inversePrimary: 78,
  surfaceContainerLowest: 6, surfaceContainerLow: 14, surfaceContainer: 17,
  surfaceContainerHigh: 21, surfaceContainerHighest: 26
};

/**
 * Generates the full Material 3 role set for light, dark and expressive
 * schemes from a single seed color.
 *
 * V3: accepts an optional `accentSeed` (see `extractPaletteSeeds` in
 * colorUtils.js) — when the wallpaper analysis found a genuine second
 * accent color, its hue anchors the Tertiary ramp instead of the fixed
 * +60° rotation, so Tertiary is drawn from the actual image rather than
 * always being purely algorithmic. Omitting it reproduces the previous
 * (V1/V2) behavior exactly.
 */
export function generateMaterialSchemes(seed, accentSeed) {
  const accentHue = accentSeed?.h;
  const standardRamps = buildTonalRamps(seed.h, seed.s, accentHue);
  const expressiveRamps = buildExpressiveRamps(seed.h, seed.s, accentHue);

  return {
    light: roleSet(standardRamps, LIGHT_TONES),
    dark: roleSet(standardRamps, DARK_TONES),
    expressive: roleSet(expressiveRamps, EXPRESSIVE_TONES)
  };
}

export const ROLE_LABELS = [
  ['primary', 'Primary'],
  ['onPrimary', 'On Primary'],
  ['primaryContainer', 'Primary Container'],
  ['onPrimaryContainer', 'On Primary Container'],
  ['secondary', 'Secondary'],
  ['onSecondary', 'On Secondary'],
  ['secondaryContainer', 'Secondary Container'],
  ['onSecondaryContainer', 'On Secondary Container'],
  ['tertiary', 'Tertiary'],
  ['onTertiary', 'On Tertiary'],
  ['tertiaryContainer', 'Tertiary Container'],
  ['onTertiaryContainer', 'On Tertiary Container'],
  ['background', 'Background'],
  ['onBackground', 'On Background'],
  ['surface', 'Surface'],
  ['onSurface', 'On Surface'],
  ['surfaceVariant', 'Surface Variant'],
  ['onSurfaceVariant', 'On Surface Variant'],
  ['surfaceTint', 'Surface Tint'],
  ['outline', 'Outline'],
  ['outlineVariant', 'Outline Variant'],
  ['error', 'Error'],
  ['onError', 'On Error'],
  ['errorContainer', 'Error Container'],
  ['onErrorContainer', 'On Error Container'],
  ['inverseSurface', 'Inverse Surface'],
  ['inverseOnSurface', 'Inverse On Surface'],
  ['inversePrimary', 'Inverse Primary']
];

/**
 * V3: semantic foreground/background pairs worth checking for contrast —
 * every "on-X drawn on X" combination that actually appears in the UI.
 * Drives the new accessibility panel; deliberately a plain data list next
 * to ROLE_LABELS rather than a parallel system.
 */
export const CONTRAST_PAIRS = [
  ['primary', 'onPrimary', 'Primary / On Primary'],
  ['primaryContainer', 'onPrimaryContainer', 'Primary Container / On Primary Container'],
  ['secondary', 'onSecondary', 'Secondary / On Secondary'],
  ['secondaryContainer', 'onSecondaryContainer', 'Secondary Container / On Secondary Container'],
  ['tertiary', 'onTertiary', 'Tertiary / On Tertiary'],
  ['tertiaryContainer', 'onTertiaryContainer', 'Tertiary Container / On Tertiary Container'],
  ['error', 'onError', 'Error / On Error'],
  ['errorContainer', 'onErrorContainer', 'Error Container / On Error Container'],
  ['background', 'onBackground', 'Background / On Background'],
  ['surface', 'onSurface', 'Surface / On Surface'],
  ['surfaceVariant', 'onSurfaceVariant', 'Surface Variant / On Surface Variant'],
  ['inverseSurface', 'inverseOnSurface', 'Inverse Surface / Inverse On Surface']
];

export const DEFAULT_SEED = { hex: '#6750A4', h: 262, s: 46, l: 47 };

/**
 * Applies a sparse set of manually-edited roles on top of a generated
 * scheme. Cheap shallow merge — `overrides` only ever contains validated
 * `#RRGGBB` strings for known role keys (see `useMaterialTheme`).
 */
export function mergeOverrides(scheme, overrides) {
  if (!overrides || Object.keys(overrides).length === 0) return scheme;
  return { ...scheme, ...overrides };
}

/** All valid role keys, for validating edits/overrides against. */
export const ROLE_KEYS = new Set(ROLE_LABELS.map(([key]) => key));
