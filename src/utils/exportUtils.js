import { ROLE_LABELS } from './materialPalette';
import { createZipBlob } from './zipUtils';

function downloadBlobFile(filename, content, mime = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const kebab = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const snake = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

export function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  return Promise.resolve();
}

// ---------------------------------------------------------------------
// Content builders — each returns { filename, content, mime } and touches
// nothing but the scheme it's given. All exports reflect the current active
// scheme, including any manual role edits and Dark/Expressive mode.
// ---------------------------------------------------------------------

function buildJSONContent(scheme, schemeName) {
  const payload = {
    name: 'ToneLab Palette',
    scheme: schemeName,
    generatedAt: new Date().toISOString(),
    colors: scheme
  };
  return {
    filename: `material-you-${schemeName}.json`,
    content: JSON.stringify(payload, null, 2),
    mime: 'application/json'
  };
}

function buildCSSContent(scheme, schemeName) {
  const lines = [':root {'];
  Object.keys(scheme).forEach((key) => {
    if (scheme[key]) lines.push(`  --md-sys-color-${kebab(key)}: ${scheme[key]};`);
  });
  lines.push('}');
  return { filename: `material-you-${schemeName}.css`, content: lines.join('\n'), mime: 'text/css' };
}

function buildAndroidXMLContent(scheme, schemeName) {
  const lines = ['<?xml version="1.0" encoding="utf-8"?>', '<resources>'];
  Object.keys(scheme).forEach((key) => {
    if (scheme[key]) lines.push(`    <color name="md_${snake(key)}">${scheme[key]}</color>`);
  });
  lines.push('</resources>');
  return { filename: `material_you_${schemeName}_colors.xml`, content: lines.join('\n'), mime: 'application/xml' };
}

function buildTailwindContent(scheme, schemeName) {
  const entries = Object.keys(scheme)
    .filter((key) => scheme[key])
    .map((key) => `        '${kebab(key)}': '${scheme[key]}',`)
    .join('\n');
  const content = `/** ToneLab — Tailwind color tokens (${schemeName}) */
module.exports = {
  theme: {
    extend: {
      colors: {
        materialYou: {
${entries}
        }
      }
    }
  }
};
`;
  return { filename: `tailwind.material-you-${schemeName}.config.js`, content, mime: 'text/javascript' };
}

function buildFlutterContent(scheme, schemeName) {
  const toFlutterColor = (hex) => {
    if (!hex) return 'Color(0xFF000000)';
    const clean = hex.replace('#', '').toUpperCase();
    return `Color(0xFF${clean.padStart(6, '0')})`;
  };
  const isDark = schemeName === 'dark' || schemeName === 'expressive';
  const content = `// ToneLab — Flutter ColorScheme (${schemeName})
import 'package:flutter/material.dart';

final ColorScheme materialYou${schemeName[0].toUpperCase()}${schemeName.slice(1)}Scheme = ColorScheme(
  brightness: Brightness.${isDark ? 'dark' : 'light'},
  primary: ${toFlutterColor(scheme.primary)},
  onPrimary: ${toFlutterColor(scheme.onPrimary)},
  primaryContainer: ${toFlutterColor(scheme.primaryContainer)},
  onPrimaryContainer: ${toFlutterColor(scheme.onPrimaryContainer)},
  secondary: ${toFlutterColor(scheme.secondary)},
  onSecondary: ${toFlutterColor(scheme.onSecondary)},
  secondaryContainer: ${toFlutterColor(scheme.secondaryContainer)},
  onSecondaryContainer: ${toFlutterColor(scheme.onSecondaryContainer)},
  tertiary: ${toFlutterColor(scheme.tertiary)},
  onTertiary: ${toFlutterColor(scheme.onTertiary)},
  tertiaryContainer: ${toFlutterColor(scheme.tertiaryContainer)},
  onTertiaryContainer: ${toFlutterColor(scheme.onTertiaryContainer)},
  error: ${toFlutterColor(scheme.error)},
  onError: ${toFlutterColor(scheme.onError)},
  errorContainer: ${toFlutterColor(scheme.errorContainer)},
  onErrorContainer: ${toFlutterColor(scheme.onErrorContainer)},
  background: ${toFlutterColor(scheme.background)},
  onBackground: ${toFlutterColor(scheme.onBackground)},
  surface: ${toFlutterColor(scheme.surface)},
  onSurface: ${toFlutterColor(scheme.onSurface)},
  surfaceVariant: ${toFlutterColor(scheme.surfaceVariant)},
  onSurfaceVariant: ${toFlutterColor(scheme.onSurfaceVariant)},
  outline: ${toFlutterColor(scheme.outline)},
  outlineVariant: ${toFlutterColor(scheme.outlineVariant)},
  inverseSurface: ${toFlutterColor(scheme.inverseSurface)},
  onInverseSurface: ${toFlutterColor(scheme.inverseOnSurface || scheme.inverseSurface)},
  inversePrimary: ${toFlutterColor(scheme.inversePrimary)},
  shadow: ${toFlutterColor(scheme.shadow || '#000000')},
  scrim: ${toFlutterColor(scheme.scrim || '#000000')},
);
`;
  return { filename: `material_you_${schemeName}_theme.dart`, content, mime: 'text/x-dart' };
}

function buildFigmaContent(scheme, schemeName) {
  const tokens = {};
  ROLE_LABELS.forEach(([key, label]) => {
    if (!scheme[key]) return;
    tokens[label] = {
      value: scheme[key],
      type: 'color',
      description: `Material 3 ${label} role (${schemeName} scheme)`
    };
  });
  ['surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer', 'surfaceContainerHigh', 'surfaceContainerHighest'].forEach((key) => {
    if (scheme[key]) {
      tokens[key] = {
        value: scheme[key],
        type: 'color',
        description: `Material 3 ${key} role (${schemeName} scheme)`
      };
    }
  });
  const payload = { 'ToneLab': { [schemeName]: tokens } };
  return {
    filename: `material-you-${schemeName}.tokens.json`,
    content: JSON.stringify(payload, null, 2),
    mime: 'application/json'
  };
}

// ---------------------------------------------------------------------
// Public "build + download" exports
// ---------------------------------------------------------------------

export function exportJSON(scheme, schemeName) {
  const { filename, content, mime } = buildJSONContent(scheme, schemeName);
  downloadBlobFile(filename, content, mime);
}

export function exportCSSVariables(scheme, schemeName) {
  const { filename, content, mime } = buildCSSContent(scheme, schemeName);
  downloadBlobFile(filename, content, mime);
}

export function exportAndroidXML(scheme, schemeName) {
  const { filename, content, mime } = buildAndroidXMLContent(scheme, schemeName);
  downloadBlobFile(filename, content, mime);
}

export function exportTailwindConfig(scheme, schemeName) {
  const { filename, content, mime } = buildTailwindContent(scheme, schemeName);
  downloadBlobFile(filename, content, mime);
}

export function exportFlutterTheme(scheme, schemeName) {
  const { filename, content, mime } = buildFlutterContent(scheme, schemeName);
  downloadBlobFile(filename, content, mime);
}

export function exportFigmaTokens(scheme, schemeName) {
  const { filename, content, mime } = buildFigmaContent(scheme, schemeName);
  downloadBlobFile(filename, content, mime);
}

/**
 * "Export All" — bundles every file-based export format into a single .zip,
 * guaranteed to match what each button produces on its own, including
 * any manually-edited roles.
 */
export function exportAllAsZip(scheme, schemeName) {
  const files = [
    buildJSONContent(scheme, schemeName),
    buildCSSContent(scheme, schemeName),
    buildAndroidXMLContent(scheme, schemeName),
    buildTailwindContent(scheme, schemeName),
    buildFlutterContent(scheme, schemeName),
    buildFigmaContent(scheme, schemeName)
  ];

  const zipBlob = createZipBlob(files.map(({ filename, content }) => ({ name: filename, content })));
  downloadBlobFile(`tonelab-${schemeName}-export.zip`, zipBlob, 'application/zip');
}
