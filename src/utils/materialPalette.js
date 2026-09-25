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
  const primaryS = clamp(sourceS, 32, 68);
  const secondaryS = clamp(sourceS * 0.38, 12, 32);
  const tertiaryS = clamp(sourceS * 0.5, 18, 44);
  const neutralS = clamp(sourceS * 0.08, 4, 10);
  const neutralVariantS = clamp(sourceS * 0.16, 8, 18);
  // When wallpaper analysis found a genuine second accent color,
  // anchor Tertiary to its actual hue instead of a fixed rotation.
  const tertiaryHue = accentHue !== undefined && accentHue !== null ? accentHue : (sourceH + 60) % 360;

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
  const primaryS = clamp(sourceS * 1.3 + 16, 62, 96);
  const secondaryHue = (sourceH + 32) % 360;
  const secondaryS = clamp(sourceS * 0.85 + 20, 42, 85);
  const tertiaryHue = accentHue !== undefined && accentHue !== null ? accentHue : (sourceH + 120) % 360;
  const tertiaryS = clamp(sourceS * 0.95 + 22, 52, 92);
  const neutralS = clamp(sourceS * 0.12, 6, 16);
  const neutralVariantS = clamp(sourceS * 0.26, 14, 30);

  return {
    primary: (l) => tone(sourceH, primaryS, l),
    secondary: (l) => tone(secondaryHue, secondaryS, l),
    tertiary: (l) => tone(tertiaryHue, tertiaryS, l),
    neutral: (l) => tone(sourceH, neutralS, l),
    neutralVariant: (l) => tone(sourceH, neutralVariantS, l),
    error: (l) => tone(8, 86, l)
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
  primary: 80, onPrimary: 20, primaryContainer: 26, onPrimaryContainer: 90,
  secondary: 76, onSecondary: 20, secondaryContainer: 24, onSecondaryContainer: 90,
  tertiary: 76, onTertiary: 20, tertiaryContainer: 24, onTertiaryContainer: 90,
  error: 80, onError: 20, errorContainer: 26, onErrorContainer: 90,
  background: 6, onBackground: 90,
  surface: 6, onSurface: 90, surfaceVariant: 24, onSurfaceVariant: 78,
  outline: 55, outlineVariant: 26,
  inverseSurface: 90, inverseOnSurface: 20, inversePrimary: 40,
  surfaceContainerLowest: 4, surfaceContainerLow: 8, surfaceContainer: 12,
  surfaceContainerHigh: 16, surfaceContainerHighest: 20
};

const EXPRESSIVE_TONES = {
  primary: 84, onPrimary: 16, primaryContainer: 34, onPrimaryContainer: 95,
  secondary: 82, onSecondary: 16, secondaryContainer: 32, onSecondaryContainer: 95,
  tertiary: 84, onTertiary: 16, tertiaryContainer: 32, onTertiaryContainer: 95,
  error: 82, onError: 16, errorContainer: 34, onErrorContainer: 95,
  background: 8, onBackground: 95,
  surface: 8, onSurface: 95, surfaceVariant: 26, onSurfaceVariant: 82,
  outline: 62, outlineVariant: 32,
  inverseSurface: 92, inverseOnSurface: 14, inversePrimary: 44,
  surfaceContainerLowest: 5, surfaceContainerLow: 12, surfaceContainer: 16,
  surfaceContainerHigh: 22, surfaceContainerHighest: 28
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
export const DEFAULT_DARK_SCHEME = {
  primary: '#8AB4F8',
  onPrimary: '#07111D',
  primaryContainer: '#1B304A',
  onPrimaryContainer: '#D8E8FF',
  secondary: '#A9B8C8',
  onSecondary: '#141D26',
  secondaryContainer: '#202932',
  onSecondaryContainer: '#D5E4F5',
  tertiary: '#9FB8C8',
  onTertiary: '#111D25',
  tertiaryContainer: '#232B32',
  onTertiaryContainer: '#D4E7F5',
  error: '#F2B8B5',
  onError: '#601410',
  errorContainer: '#8C1D18',
  onErrorContainer: '#F9DEDC',
  background: '#0B0D0F',
  onBackground: '#F1F3F4',
  surface: '#111417',
  onSurface: '#F1F3F4',
  surfaceVariant: '#1E2328',
  onSurfaceVariant: '#AEB5BD',
  surfaceTint: '#8AB4F8',
  outline: '#343A40',
  outlineVariant: '#282E35',
  inverseSurface: '#F1F3F4',
  inverseOnSurface: '#111417',
  inversePrimary: '#1A73E8',
  shadow: '#000000',
  scrim: '#000000',
  surfaceContainerLowest: '#080A0C',
  surfaceContainerLow: '#0E1013',
  surfaceContainer: '#171B1F',
  surfaceContainerHigh: '#1C2126',
  surfaceContainerHighest: '#22272D'
};

export const DEFAULT_LIGHT_SCHEME = {
  primary: '#1A73E8',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D8E8FF',
  onPrimaryContainer: '#07111D',
  secondary: '#485A6C',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D5E4F5',
  onSecondaryContainer: '#121C26',
  tertiary: '#425E70',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#D2E4F2',
  onTertiaryContainer: '#0E1D27',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  background: '#F8F9FA',
  onBackground: '#111417',
  surface: '#FFFFFF',
  onSurface: '#111417',
  surfaceVariant: '#DFE3E7',
  onSurfaceVariant: '#41474D',
  surfaceTint: '#1A73E8',
  outline: '#71787E',
  outlineVariant: '#C1C7CE',
  inverseSurface: '#111417',
  inverseOnSurface: '#F1F3F4',
  inversePrimary: '#8AB4F8',
  shadow: '#000000',
  scrim: '#000000',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F4F6F8',
  surfaceContainer: '#EEF0F3',
  surfaceContainerHigh: '#E8EAEF',
  surfaceContainerHighest: '#E2E4E8'
};

export const DEFAULT_EXPRESSIVE_SCHEME = {
  ...DEFAULT_DARK_SCHEME,
  primary: '#6EA8FE',
  onPrimary: '#002B66',
  primaryContainer: '#1C427F',
  onPrimaryContainer: '#DCE8FF',
  secondary: '#B794F4',
  onSecondary: '#2E1065',
  secondaryContainer: '#3C1E6D',
  onSecondaryContainer: '#F3E8FF',
  tertiary: '#38BDF8',
  onTertiary: '#00354E',
  tertiaryContainer: '#0B4761',
  onTertiaryContainer: '#D2F3FF',
  background: '#0E1217',
  onBackground: '#F3F4F6',
  surface: '#131821',
  onSurface: '#F3F4F6',
  surfaceVariant: '#242C38',
  onSurfaceVariant: '#B8C3D3',
  surfaceTint: '#6EA8FE',
  outline: '#58677C',
  outlineVariant: '#323E4E',
  surfaceContainerLowest: '#0A0D12',
  surfaceContainerLow: '#10151C',
  surfaceContainer: '#181E28',
  surfaceContainerHigh: '#202835',
  surfaceContainerHighest: '#283242'
};

export const DEFAULT_SEED = { hex: '#8AB4F8', h: 217, s: 89, l: 76 };

export function generateMaterialSchemes(seed, accentSeed) {
  // Pre-upload fallback: Graphite + Subtle Blue theme
  if (seed?.hex?.toUpperCase() === DEFAULT_SEED.hex.toUpperCase() && !accentSeed) {
    return {
      light: { ...DEFAULT_LIGHT_SCHEME },
      dark: { ...DEFAULT_DARK_SCHEME },
      expressive: { ...DEFAULT_EXPRESSIVE_SCHEME }
    };
  }

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
 * Semantic grouping for the Material 3 color system. Organizes all 28
 * roles into logical categories without omitting or duplicating any role.
 */
export const ROLE_GROUPS = [
  {
    id: 'primary',
    name: 'Primary',
    description: 'Key accent color for prominent action buttons, active states, and focus elements.',
    roles: [
      ['primary', 'Primary'],
      ['onPrimary', 'On Primary'],
      ['primaryContainer', 'Primary Container'],
      ['onPrimaryContainer', 'On Primary Container']
    ]
  },
  {
    id: 'secondary',
    name: 'Secondary',
    description: 'Less prominent accents for secondary components, filter chips, and badges.',
    roles: [
      ['secondary', 'Secondary'],
      ['onSecondary', 'On Secondary'],
      ['secondaryContainer', 'Secondary Container'],
      ['onSecondaryContainer', 'On Secondary Container']
    ]
  },
  {
    id: 'tertiary',
    name: 'Tertiary',
    description: 'Harmonic accent derived from wallpaper tones for contrasting highlights and widgets.',
    roles: [
      ['tertiary', 'Tertiary'],
      ['onTertiary', 'On Tertiary'],
      ['tertiaryContainer', 'Tertiary Container'],
      ['onTertiaryContainer', 'On Tertiary Container']
    ]
  },
  {
    id: 'surfaces',
    name: 'Surfaces & Background',
    description: 'Foundational canvas, card surfaces, sheets, and container backgrounds.',
    roles: [
      ['background', 'Background'],
      ['onBackground', 'On Background'],
      ['surface', 'Surface'],
      ['onSurface', 'On Surface'],
      ['surfaceVariant', 'Surface Variant'],
      ['onSurfaceVariant', 'On Surface Variant'],
      ['surfaceTint', 'Surface Tint']
    ]
  },
  {
    id: 'outline',
    name: 'Outline',
    description: 'Structural boundaries, dividers, and component borders.',
    roles: [
      ['outline', 'Outline'],
      ['outlineVariant', 'Outline Variant']
    ]
  },
  {
    id: 'system',
    name: 'System',
    description: 'Semantic feedback, alert states, and error messaging.',
    roles: [
      ['error', 'Error'],
      ['onError', 'On Error'],
      ['errorContainer', 'Error Container'],
      ['onErrorContainer', 'On Error Container']
    ]
  },
  {
    id: 'inverse',
    name: 'Inverse',
    description: 'Opposite tonal surfaces and elements for floating snackbars and high-contrast tips.',
    roles: [
      ['inverseSurface', 'Inverse Surface'],
      ['inverseOnSurface', 'Inverse On Surface'],
      ['inversePrimary', 'Inverse Primary']
    ]
  }
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
