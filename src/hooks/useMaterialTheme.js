import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { hexToHsl, normalizeHex } from '../utils/colorUtils';
import { generateMaterialSchemes, mergeOverrides, ROLE_KEYS, DEFAULT_SEED } from '../utils/materialPalette';
import { processWallpaperFile, revokePreviewUrl } from '../utils/imageProcessing';
import { decodePaletteStateFromLocation, buildShareUrl } from '../utils/share';

const kebab = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const EMPTY_OVERRIDES = { light: {}, dark: {}, expressive: {} };

const ERROR_MESSAGES = {
  UNSUPPORTED_FORMAT: 'Unsupported format. Please use JPG, PNG, JPEG or WEBP.',
  FILE_TOO_LARGE: "That image is too large to process — try something under 45MB.",
  DECODE_FAILED: "Couldn't read that image. Please try a different file."
};

function applySchemeToRoot(scheme) {
  const root = document.documentElement;
  for (const key in scheme) {
    root.style.setProperty(`--md-sys-color-${kebab(key)}`, scheme[key]);
  }
}

function seedFromHex(hex) {
  const normalized = normalizeHex(hex) || DEFAULT_SEED.hex;
  const { h, s, l } = hexToHsl(normalized);
  return { hex: normalized, h, s, l };
}

export function useMaterialTheme() {
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [accent, setAccent] = useState(null); // { hex, h, s, l } | null — see extractPaletteSeeds
  const [schemes, setSchemes] = useState(() => generateMaterialSchemes(DEFAULT_SEED));
  const [overrides, setOverrides] = useState(EMPTY_OVERRIDES);
  const [themeMode, setThemeMode] = useState('dark'); // 'light' | 'dark' | 'expressive'
  const [sourceImage, setSourceImage] = useState(null); // { previewUrl, fileName, downscaled }
  const [status, setStatus] = useState('idle'); // idle | processing | ready | error
  const [errorMessage, setErrorMessage] = useState('');
  const [restoredFromShare, setRestoredFromShare] = useState(false);

  const previewUrlRef = useRef(null);
  const generationIdRef = useRef(0);

  // ---------- Hydrate from a shared link on first mount ----------
  useEffect(() => {
    const decoded = decodePaletteStateFromLocation();
    if (!decoded) return;
    const nextSeed = seedFromHex(decoded.seedHex);
    const nextAccent = decoded.accentHex ? seedFromHex(decoded.accentHex) : null;
    setSeed(nextSeed);
    setAccent(nextAccent);
    setSchemes(generateMaterialSchemes(nextSeed, nextAccent));
    setThemeMode(decoded.themeMode);
    setOverrides({ ...EMPTY_OVERRIDES, ...decoded.overrides });
    setStatus('ready');
    setRestoredFromShare(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => revokePreviewUrl(previewUrlRef.current), []);

  const mergedSchemes = useMemo(
    () => ({
      light: mergeOverrides(schemes.light, overrides.light),
      dark: mergeOverrides(schemes.dark, overrides.dark),
      expressive: mergeOverrides(schemes.expressive, overrides.expressive)
    }),
    [schemes, overrides]
  );

  const activeScheme = mergedSchemes[themeMode] || mergedSchemes.dark;
  const activeRawScheme = schemes[themeMode] || schemes.dark;
  const activeOverrides = overrides[themeMode] || {};
  const hasEditedRoles = Object.keys(activeOverrides).length > 0;

  useEffect(() => {
    applySchemeToRoot(activeScheme);
    document.documentElement.classList.toggle('theme-light', themeMode === 'light');

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', activeScheme.surface);
  }, [activeScheme, themeMode]);

  const generateFromImage = useCallback(async (file) => {
    const generationId = ++generationIdRef.current;
    setStatus('processing');
    setErrorMessage('');

    let processed;
    try {
      processed = await processWallpaperFile(file);
    } catch (err) {
      if (generationId !== generationIdRef.current) return; // superseded by a newer upload
      setStatus('error');
      setErrorMessage(ERROR_MESSAGES[err.message] || 'Something went wrong reading that image.');
      return;
    }

    if (generationId !== generationIdRef.current) {
      // A newer upload started while this one was processing — discard.
      revokePreviewUrl(processed.previewUrl);
      return;
    }

    try {
      // The seed (and, when present, accent) color were already sampled
      // inside processWallpaperFile from the smallest available source —
      // no need to touch the image data a second time here.
      const nextSeed = processed.seed;
      const nextAccent = processed.accent;
      const nextSchemes = generateMaterialSchemes(nextSeed, nextAccent);

      revokePreviewUrl(previewUrlRef.current);
      previewUrlRef.current = processed.previewUrl;

      setSeed(nextSeed);
      setAccent(nextAccent);
      setSchemes(nextSchemes);
      setOverrides(EMPTY_OVERRIDES);
      setSourceImage({ previewUrl: processed.previewUrl, fileName: file.name, downscaled: processed.downscaled });
      setRestoredFromShare(false);
      setStatus('ready');
    } catch (err) {
      revokePreviewUrl(processed.previewUrl);
      setStatus('error');
      setErrorMessage('Could not extract a color from that image. Please try another.');
    }
  }, []);

  const clearImage = useCallback(() => {
    generationIdRef.current += 1; // cancel any in-flight processing
    revokePreviewUrl(previewUrlRef.current);
    previewUrlRef.current = null;
    setSeed(DEFAULT_SEED);
    setAccent(null);
    setSchemes(generateMaterialSchemes(DEFAULT_SEED));
    setOverrides(EMPTY_OVERRIDES);
    setSourceImage(null);
    setErrorMessage('');
    setRestoredFromShare(false);
    setStatus('idle');
  }, []);

  const setRoleColor = useCallback((roleKey, hex) => {
    if (!ROLE_KEYS.has(roleKey)) return;
    const normalized = normalizeHex(hex);
    if (!normalized) return;
    setOverrides((prev) => ({
      ...prev,
      [themeMode]: { ...prev[themeMode], [roleKey]: normalized }
    }));
  }, [themeMode]);

  const resetRoleColor = useCallback((roleKey) => {
    setOverrides((prev) => {
      if (!(roleKey in prev[themeMode])) return prev;
      const nextModeOverrides = { ...prev[themeMode] };
      delete nextModeOverrides[roleKey];
      return { ...prev, [themeMode]: nextModeOverrides };
    });
  }, [themeMode]);

  /**
   * V3: "Reset Palette" — clears every manually-edited role for the
   * current theme mode, restoring the generated palette. Does NOT touch
   * the uploaded wallpaper, seed, or the other two theme modes' edits.
   */
  const resetAllOverrides = useCallback(() => {
    setOverrides((prev) => {
      if (Object.keys(prev[themeMode]).length === 0) return prev;
      return { ...prev, [themeMode]: {} };
    });
  }, [themeMode]);

  const buildShareLink = useCallback(
    () => buildShareUrl({ seedHex: seed.hex, accentHex: accent?.hex ?? null, themeMode, overrides }),
    [seed, accent, themeMode, overrides]
  );

  return {
    seed,
    accent,
    schemes,
    overrides,
    mergedSchemes,
    activeScheme,
    activeRawScheme,
    activeOverrides,
    hasEditedRoles,
    themeMode,
    setThemeMode,
    sourceImage,
    status,
    errorMessage,
    restoredFromShare,
    generateFromImage,
    clearImage,
    setRoleColor,
    resetRoleColor,
    resetAllOverrides,
    buildShareLink
  };
}
