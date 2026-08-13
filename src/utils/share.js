// V2: shareable palette links — fully client-side, no backend.
//
// The URL encodes just enough to *recreate* the palette: the seed color, the
// active theme mode, and any manually-edited roles (sparse — only edited
// keys are included). The original wallpaper image is intentionally never
// encoded (it would make the URL huge); the palette/theme configuration is
// what matters, per the V2 spec.

const VERSION = 1;
const MODE_TO_SHORT = { light: 'l', dark: 'd', expressive: 'e' };
const SHORT_TO_MODE = { l: 'light', d: 'dark', e: 'expressive' };
const HEX6_RE = /^[0-9a-fA-F]{6}$/;

function toBase64Url(str) {
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  return decodeURIComponent(escape(atob(padded)));
}

/**
 * @param {{ seedHex: string, accentHex?: string|null, themeMode: 'light'|'dark'|'expressive', overrides: Record<string, Record<string,string>> }} state
 */
export function encodePaletteState({ seedHex, accentHex, themeMode, overrides }) {
  const cleanSeed = (seedHex || '').replace('#', '');
  if (!HEX6_RE.test(cleanSeed)) return null;

  const payload = { v: VERSION, s: cleanSeed.toUpperCase(), m: MODE_TO_SHORT[themeMode] || 'd' };

  const cleanAccent = typeof accentHex === 'string' ? accentHex.replace('#', '') : '';
  if (HEX6_RE.test(cleanAccent)) payload.a = cleanAccent.toUpperCase();

  const o = {};
  Object.entries(overrides || {}).forEach(([mode, roles]) => {
    const shortMode = MODE_TO_SHORT[mode];
    if (!shortMode || !roles) return;
    const cleanRoles = {};
    Object.entries(roles).forEach(([role, hex]) => {
      const clean = typeof hex === 'string' ? hex.replace('#', '') : '';
      if (HEX6_RE.test(clean)) cleanRoles[role] = clean.toUpperCase();
    });
    if (Object.keys(cleanRoles).length) o[shortMode] = cleanRoles;
  });
  if (Object.keys(o).length) payload.o = o;

  try {
    return toBase64Url(JSON.stringify(payload));
  } catch (err) {
    return null;
  }
}

export function buildShareUrl(state) {
  const encoded = encodePaletteState(state);
  if (!encoded) return null;
  try {
    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.set('p', encoded);
    return url.toString();
  } catch (err) {
    return null;
  }
}

const THEME_LABEL = { light: 'Material Light', dark: 'Material Dark', expressive: 'Material Expressive' };

/**
 * V3: a short, readable text summary of a palette — used as the body for
 * the Web Share API and the clipboard fallback, so sharing produces
 * something a person can actually read (title, theme, a handful of key
 * hex values) rather than a bare link.
 */
export function buildShareText(scheme, themeMode) {
  const themeLabel = THEME_LABEL[themeMode] || 'Material';
  const lines = [
    `Material You Studio palette — ${themeLabel}`,
    `Primary ${scheme.primary}  ·  Secondary ${scheme.secondary}  ·  Tertiary ${scheme.tertiary}`,
    `Surface ${scheme.surface}  ·  Background ${scheme.background}`
  ];
  return lines.join('\n');
}

/**
 * Reads `?p=` from the current URL and decodes it back into palette state.
 * Returns `null` (never throws) on anything malformed, so a bad/tampered
 * link degrades gracefully to the default app state.
 */
export function decodePaletteStateFromLocation() {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('p');
    if (!encoded) return null;

    const payload = JSON.parse(fromBase64Url(encoded));
    if (!payload || payload.v !== VERSION || typeof payload.s !== 'string' || !HEX6_RE.test(payload.s)) {
      return null;
    }

    const themeMode = SHORT_TO_MODE[payload.m] || 'dark';
    const seedHex = `#${payload.s.toUpperCase()}`;
    const accentHex = typeof payload.a === 'string' && HEX6_RE.test(payload.a) ? `#${payload.a.toUpperCase()}` : null;

    const overrides = { light: {}, dark: {}, expressive: {} };
    if (payload.o && typeof payload.o === 'object') {
      Object.entries(payload.o).forEach(([shortMode, roles]) => {
        const mode = SHORT_TO_MODE[shortMode];
        if (!mode || !roles || typeof roles !== 'object') return;
        Object.entries(roles).forEach(([role, hex]) => {
          if (typeof hex === 'string' && HEX6_RE.test(hex)) {
            overrides[mode][role] = `#${hex.toUpperCase()}`;
          }
        });
      });
    }

    return { seedHex, accentHex, themeMode, overrides };
  } catch (err) {
    return null;
  }
}
