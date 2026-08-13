import { hexToRgb, getContrastTextColor } from './colorUtils';

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Draws a Pixel-style Material You home screen using the generated palette. */
function drawPixelScreen(ctx, W, H, scheme) {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, scheme.primaryContainer);
  grad.addColorStop(1, scheme.tertiaryContainer);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Status bar
  ctx.fillStyle = getContrastTextColor(scheme.primaryContainer);
  ctx.font = `600 ${W * 0.032}px "Roboto Flex", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText('9:41', W * 0.06, H * 0.045);
  ctx.textAlign = 'right';
  ctx.fillText('5G  100%', W * 0.94, H * 0.045);
  ctx.textAlign = 'left';

  // Clock widget
  ctx.fillStyle = getContrastTextColor(scheme.primaryContainer);
  ctx.font = `500 ${W * 0.16}px "Roboto Flex", sans-serif`;
  ctx.fillText('9:41', W * 0.08, H * 0.16);
  ctx.font = `400 ${W * 0.045}px "Roboto", sans-serif`;
  ctx.fillText('Saturday, August 8', W * 0.08, H * 0.205);

  // Search pill
  const pillY = H * 0.25;
  ctx.fillStyle = rgba(scheme.surfaceContainerHigh, 0.92);
  roundRect(ctx, W * 0.06, pillY, W * 0.88, H * 0.06, H * 0.03);
  ctx.fill();
  ctx.fillStyle = scheme.primary;
  ctx.beginPath();
  ctx.arc(W * 0.13, pillY + H * 0.03, W * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = scheme.onSurfaceVariant;
  ctx.font = `400 ${W * 0.035}px "Roboto", sans-serif`;
  ctx.fillText('Search', W * 0.19, pillY + H * 0.031);

  // "At a glance" widget card — uses the tertiary container pairing so more
  // of the generated role set is visibly represented, not just raw fills.
  const widgetY = H * 0.335;
  const widgetH = H * 0.075;
  ctx.fillStyle = scheme.tertiaryContainer;
  roundRect(ctx, W * 0.06, widgetY, W * 0.88, widgetH, H * 0.02);
  ctx.fill();
  ctx.fillStyle = scheme.onTertiaryContainer;
  ctx.font = `500 ${W * 0.032}px "Roboto", sans-serif`;
  ctx.fillText('Palette applied', W * 0.1, widgetY + widgetH / 2 - H * 0.006);
  ctx.font = `400 ${W * 0.026}px "Roboto", sans-serif`;
  ctx.fillText('Tap a role card to fine-tune', W * 0.1, widgetY + widgetH / 2 + H * 0.02);

  // App icon grid
  const iconColors = [scheme.primary, scheme.secondary, scheme.tertiary, scheme.error, scheme.primaryContainer, scheme.secondaryContainer, scheme.tertiaryContainer, scheme.inversePrimary];
  const cols = 4;
  const gridTop = H * 0.44;
  const cell = W * 0.2;
  const gap = (W - cell * cols) / (cols + 1);
  iconColors.forEach((color, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = gap + col * (cell + gap);
    const y = gridTop + row * (cell + H * 0.032);
    ctx.fillStyle = color;
    roundRect(ctx, x, y, cell, cell, cell * 0.32);
    ctx.fill();
  });

  // Dock
  const dockY = H * 0.86;
  ctx.fillStyle = rgba(scheme.surfaceContainerHigh, 0.92);
  roundRect(ctx, W * 0.06, dockY, W * 0.88, H * 0.09, H * 0.045);
  ctx.fill();
  const dockIcons = [scheme.primary, scheme.tertiary, scheme.secondary, scheme.error];
  const dockCell = W * 0.13;
  const dockGap = (W * 0.88 - dockCell * 4) / 5;
  dockIcons.forEach((color, i) => {
    const x = W * 0.06 + dockGap + i * (dockCell + dockGap);
    ctx.fillStyle = color;
    roundRect(ctx, x, dockY + H * 0.015, dockCell, dockCell, dockCell * 0.32);
    ctx.fill();
  });

  // Nav gesture bar
  ctx.fillStyle = getContrastTextColor(scheme.primaryContainer);
  roundRect(ctx, W * 0.42, H * 0.975, W * 0.16, H * 0.006, 4);
  ctx.fill();
}

/** Draws a Nothing-OS-style dot-matrix / glyph screen using the palette. */
function drawNothingScreen(ctx, W, H, scheme) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  // Dot-matrix status text
  ctx.fillStyle = scheme.primary;
  ctx.font = `600 ${W * 0.03}px "Roboto Mono", monospace`;
  ctx.textBaseline = 'middle';
  ctx.fillText('09:41', W * 0.06, H * 0.045);
  ctx.textAlign = 'right';
  ctx.fillText('5G 100%', W * 0.94, H * 0.045);
  ctx.textAlign = 'left';

  // Glyph ring clock
  const cx = W / 2;
  const cy = H * 0.28;
  const outerR = W * 0.24;
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const isMajor = i % 5 === 0;
    const r1 = outerR - (isMajor ? W * 0.028 : W * 0.014);
    const r2 = outerR;
    ctx.strokeStyle = i <= 41 ? scheme.primary : rgba(scheme.onSurfaceVariant, 0.35);
    ctx.lineWidth = isMajor ? 3 : 1.4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    ctx.stroke();
  }
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `300 ${W * 0.09}px "Roboto Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('09:41', cx, cy);
  ctx.textAlign = 'left';

  // Dot-matrix widget cards — now paired with their "on container" text
  // color so more of the generated role set is visibly represented.
  const cardY = H * 0.5;
  const cardH = H * 0.14;
  const widgetPairs = [
    { fill: scheme.primaryContainer, onFill: scheme.onPrimaryContainer, label: 'Weather' },
    { fill: scheme.tertiaryContainer, onFill: scheme.onTertiaryContainer, label: 'Battery' }
  ];
  widgetPairs.forEach(({ fill, onFill, label }, i) => {
    const x = W * 0.06 + i * (W * 0.45);
    ctx.fillStyle = fill;
    roundRect(ctx, x, cardY, W * 0.4, cardH, 6);
    ctx.fill();
    ctx.fillStyle = onFill;
    ctx.beginPath();
    ctx.arc(x + W * 0.06, cardY + cardH * 0.32, W * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `500 ${W * 0.026}px "Roboto Mono", monospace`;
    ctx.fillText(label, x + W * 0.11, cardY + cardH * 0.34);
  });

  // App list — dot-matrix rows
  const listTop = H * 0.68;
  const rowH = H * 0.05;
  const appColors = [scheme.primary, scheme.secondary, scheme.tertiary, scheme.error, scheme.inversePrimary];
  appColors.forEach((color, i) => {
    const y = listTop + i * rowH;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(W * 0.1, y, W * 0.018, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba('#FFFFFF', 0.14);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.16, y);
    ctx.lineTo(W * 0.7, y);
    ctx.stroke();
  });

  ctx.fillStyle = rgba('#FFFFFF', 0.5);
  roundRect(ctx, W * 0.42, H * 0.975, W * 0.16, H * 0.006, 4);
  ctx.fill();
}

/**
 * Renders a phone-screen mockup ("pixel" | "nothing") for the given palette
 * and returns a PNG data URL suitable for feeding into <TiltedCard imageSrc>.
 */
export function renderPhoneMockup(scheme, variant = 'pixel', width = 480, height = 1000) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (variant === 'nothing') {
    drawNothingScreen(ctx, width, height, scheme);
  } else {
    drawPixelScreen(ctx, width, height, scheme);
  }

  return canvas.toDataURL('image/png');
}
