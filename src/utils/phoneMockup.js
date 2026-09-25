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

/** Draws standard Android status bar icons (Wifi, Cellular signal, Battery). */
function drawStatusBar(ctx, W, H, textColor, isMono = false) {
  ctx.save();
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'middle';

  // Clock (left)
  if (isMono) {
    ctx.font = `600 ${W * 0.032}px "Roboto Mono", monospace`;
  } else {
    ctx.font = `600 ${W * 0.034}px "Roboto Flex", "Roboto", sans-serif`;
  }
  ctx.fillText('9:41', W * 0.07, H * 0.04);

  // Cellular signal bars (right)
  const cellX = W * 0.77;
  const cellY = H * 0.04;
  const barW = W * 0.008;
  const barGap = W * 0.005;
  for (let b = 0; b < 4; b++) {
    const barH = W * 0.01 + b * (W * 0.007);
    ctx.fillStyle = b <= 2 ? textColor : rgba(textColor, 0.35);
    roundRect(ctx, cellX + b * (barW + barGap), cellY + (W * 0.015) - barH, barW, barH, 1.5);
    ctx.fill();
  }

  // 5G Label
  ctx.fillStyle = textColor;
  ctx.font = `700 ${W * 0.024}px "Roboto", sans-serif`;
  ctx.fillText('5G', W * 0.83, cellY);

  // Battery Capsule
  const batX = W * 0.885;
  const batY = cellY - (H * 0.007);
  const batW = W * 0.048;
  const batH = H * 0.014;
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 1.6;
  roundRect(ctx, batX, batY, batW, batH, 3);
  ctx.stroke();

  // Battery nub
  ctx.fillStyle = textColor;
  roundRect(ctx, batX + batW + 1.2, batY + batH * 0.25, 2, batH * 0.5, 1);
  ctx.fill();

  // Battery fill (85%)
  ctx.fillStyle = textColor;
  roundRect(ctx, batX + 2, batY + 2, (batW - 4) * 0.85, batH - 4, 1.5);
  ctx.fill();

  ctx.restore();
}

/** Draws Google G logo on canvas. */
function drawGoogleG(ctx, cx, cy, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -0.2 * Math.PI, 1.35 * Math.PI, false);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + radius, cy);
  ctx.lineWidth = radius * 0.35;
  ctx.strokeStyle = '#4285F4';
  ctx.stroke();

  // Horizontal bar
  ctx.fillStyle = '#4285F4';
  ctx.fillRect(cx - radius * 0.1, cy - radius * 0.18, radius * 1.05, radius * 0.36);
  ctx.restore();
}

/** Draws an authentic Pixel launcher themed app icon. */
function drawThemedAppIcon(ctx, x, y, size, roleBg, iconColor, iconType, label, labelColor) {
  ctx.save();

  // App squircle container (Pixel Material You squircle)
  ctx.fillStyle = roleBg;
  roundRect(ctx, x, y, size, size, size * 0.32);
  ctx.fill();

  // Draw crisp minimalist icon glyph
  const cx = x + size / 2;
  const cy = y + size / 2;
  const s = size * 0.44;

  ctx.strokeStyle = iconColor;
  ctx.fillStyle = iconColor;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (iconType) {
    case 'phone': {
      // Receiver curve
      ctx.beginPath();
      ctx.arc(cx + s * 0.08, cy + s * 0.08, s * 0.38, Math.PI * 0.8, Math.PI * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - s * 0.12, cy - s * 0.18, s * 0.14, 0, Math.PI * 2);
      ctx.arc(cx + s * 0.18, cy + s * 0.18, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'message': {
      // Chat bubble
      ctx.beginPath();
      roundRect(ctx, cx - s * 0.45, cy - s * 0.38, s * 0.9, s * 0.65, s * 0.22);
      ctx.stroke();
      // Little tail
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.2, cy + s * 0.26);
      ctx.lineTo(cx - s * 0.36, cy + s * 0.48);
      ctx.lineTo(cx - s * 0.02, cy + s * 0.26);
      ctx.stroke();
      // Two dots
      ctx.beginPath();
      ctx.arc(cx - s * 0.15, cy - s * 0.05, s * 0.07, 0, Math.PI * 2);
      ctx.arc(cx + s * 0.15, cy - s * 0.05, s * 0.07, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'chrome': {
      // Outer circle
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.45, 0, Math.PI * 2);
      ctx.stroke();
      // Center circle
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      // 3 tangent lines
      for (let a = 0; a < 3; a++) {
        const ang = (a * 2 * Math.PI) / 3 - Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * s * 0.18, cy + Math.sin(ang) * s * 0.18);
        ctx.lineTo(cx + Math.cos(ang + 0.6) * s * 0.45, cy + Math.sin(ang + 0.6) * s * 0.45);
        ctx.stroke();
      }
      break;
    }
    case 'camera': {
      // Camera body
      roundRect(ctx, cx - s * 0.44, cy - s * 0.26, s * 0.88, s * 0.62, s * 0.16);
      ctx.stroke();
      // Lens
      ctx.beginPath();
      ctx.arc(cx, cy + s * 0.04, s * 0.18, 0, Math.PI * 2);
      ctx.stroke();
      // Top flash bump
      roundRect(ctx, cx - s * 0.15, cy - s * 0.4, s * 0.3, s * 0.12, 2);
      ctx.fill();
      break;
    }
    case 'photos': {
      // 4 pinwheel petals
      const r = s * 0.2;
      ctx.beginPath();
      ctx.arc(cx, cy - r, r, 0, Math.PI);
      ctx.arc(cx + r, cy, r, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(cx, cy + r, r, Math.PI, 0);
      ctx.arc(cx - r, cy, r, Math.PI * 1.5, Math.PI * 0.5);
      ctx.stroke();
      break;
    }
    case 'maps': {
      // Pin shape
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.1, s * 0.24, Math.PI, 0);
      ctx.lineTo(cx, cy + s * 0.36);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.1, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'settings': {
      // Gear
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      for (let g = 0; g < 6; g++) {
        const ang = (g * Math.PI) / 3;
        ctx.fillRect(cx + Math.cos(ang) * s * 0.28 - 2, cy + Math.sin(ang) * s * 0.28 - 2, 4, 4);
      }
      break;
    }
    case 'keep':
    default: {
      // Note sheet with folded corner
      roundRect(ctx, cx - s * 0.34, cy - s * 0.4, s * 0.68, s * 0.8, s * 0.14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.18, cy - s * 0.15);
      ctx.lineTo(cx + s * 0.18, cy - s * 0.15);
      ctx.moveTo(cx - s * 0.18, cy + s * 0.08);
      ctx.lineTo(cx + s * 0.12, cy + s * 0.08);
      ctx.stroke();
      break;
    }
  }

  // Label text under icon
  if (label) {
    ctx.fillStyle = labelColor;
    ctx.font = `500 ${size * 0.21}px "Roboto", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, cx, y + size + 7);
  }

  ctx.restore();
}

/** Draws a Pixel-style Material You home screen using the generated palette. */
function drawPixelScreen(ctx, W, H, scheme, themeMode = 'dark') {
  const isExpressive = themeMode === 'expressive';
  const isDark = themeMode === 'dark';

  // 1. Wallpaper background: Single solid Material tonal surface (never a gradient or color wash)
  const surfaceColor = scheme.surface || scheme.background;
  ctx.fillStyle = surfaceColor;
  ctx.fillRect(0, 0, W, H);

  const onSurfaceColor = scheme.onSurface;
  const onVariantColor = scheme.onSurfaceVariant;

  // 2. Status Bar
  drawStatusBar(ctx, W, H, onSurfaceColor, false);

  // 3. At a Glance (Pixel top header)
  const aagY = H * 0.092;
  ctx.save();
  ctx.fillStyle = onSurfaceColor;
  ctx.font = `500 ${W * 0.038}px "Roboto Flex", "Roboto", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText('Tuesday, Oct 24', W * 0.08, aagY);

  if (isExpressive) {
    // Expressive weather badge pill
    const wx = W * 0.50;
    const wy = aagY - H * 0.016;
    const ww = W * 0.42;
    const wh = H * 0.032;
    ctx.fillStyle = scheme.primaryContainer;
    roundRect(ctx, wx, wy, ww, wh, wh / 2);
    ctx.fill();

    ctx.fillStyle = scheme.primary;
    ctx.beginPath();
    ctx.arc(wx + W * 0.04, aagY, W * 0.016, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = scheme.onPrimaryContainer;
    ctx.font = `600 ${W * 0.032}px "Roboto", sans-serif`;
    ctx.fillText('72°F · Clear', wx + W * 0.075, aagY);
  } else {
    // Restrained weather indicator
    ctx.fillStyle = scheme.primary;
    ctx.beginPath();
    ctx.arc(W * 0.52, aagY, W * 0.016, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = onVariantColor;
    ctx.font = `500 ${W * 0.035}px "Roboto", sans-serif`;
    ctx.fillText('72°F · Clear', W * 0.56, aagY);
  }
  ctx.restore();

  // 4. Large Pixel Signature Material You Dual-Line Clock
  const clockY = H * 0.145;
  ctx.save();
  ctx.font = `700 ${W * 0.22}px "Roboto Flex", sans-serif`;
  ctx.textBaseline = 'top';
  ctx.letterSpacing = '-0.02em';

  // "09" in primary tone
  ctx.fillStyle = scheme.primary;
  ctx.fillText('09', W * 0.075, clockY);

  // "41" in secondary (Dark/Light) or tertiary (Expressive punchy accent)
  ctx.fillStyle = isExpressive ? scheme.tertiary : scheme.secondary;
  ctx.fillText('41', W * 0.48, clockY);
  ctx.restore();

  // 5. Featured Material You Interactive Widget (Tonal Dual Capsule)
  const widgetY = H * 0.32;
  const widgetH = H * 0.09;
  const widgetW = W * 0.86;
  const widgetX = W * 0.07;

  // Widget container card
  if (isExpressive) {
    ctx.fillStyle = rgba(scheme.surfaceContainerHigh, 0.96);
    roundRect(ctx, widgetX, widgetY, widgetW, widgetH, H * 0.024);
    ctx.fill();
    ctx.strokeStyle = rgba(scheme.primary, 0.4);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Left decorative icon badge (tertiaryContainer with onTertiaryContainer)
    const badgeSize = widgetH * 0.62;
    const badgeX = widgetX + W * 0.035;
    const badgeY = widgetY + (widgetH - badgeSize) / 2;
    ctx.fillStyle = scheme.tertiaryContainer;
    roundRect(ctx, badgeX, badgeY, badgeSize, badgeSize, badgeSize * 0.35);
    ctx.fill();

    ctx.fillStyle = scheme.onTertiaryContainer;
    ctx.beginPath();
    ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Restrained dark widget container
    ctx.fillStyle = rgba(scheme.surfaceContainer, 0.94);
    roundRect(ctx, widgetX, widgetY, widgetW, widgetH, H * 0.024);
    ctx.fill();
    ctx.strokeStyle = rgba(scheme.outlineVariant, 0.35);
    ctx.lineWidth = 1;
    ctx.stroke();

    const badgeSize = widgetH * 0.62;
    const badgeX = widgetX + W * 0.035;
    const badgeY = widgetY + (widgetH - badgeSize) / 2;
    ctx.fillStyle = scheme.surfaceContainerHighest;
    roundRect(ctx, badgeX, badgeY, badgeSize, badgeSize, badgeSize * 0.35);
    ctx.fill();

    ctx.fillStyle = scheme.primary;
    ctx.beginPath();
    ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  // Widget text: Dynamic Material Palette info
  ctx.fillStyle = scheme.onSurface;
  ctx.font = `600 ${W * 0.034}px "Roboto", sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(isExpressive ? 'Monet Expressive Active' : 'Monet Palette Active', widgetX + W * 0.18, widgetY + widgetH * 0.24);

  ctx.fillStyle = scheme.onSurfaceVariant;
  ctx.font = `400 ${W * 0.028}px "Roboto", sans-serif`;
  ctx.fillText(isExpressive ? 'Rich tonal harmonies applied' : 'Wallpaper tones applied to UI', widgetX + W * 0.18, widgetY + widgetH * 0.56);

  // Micro role swatches pill inside widget
  const swatchRoles = isExpressive
    ? [scheme.primary, scheme.secondary, scheme.tertiary, scheme.error]
    : [scheme.primary, scheme.secondary, scheme.surfaceContainerHighest, scheme.outline];
  const swatchW = W * 0.024;
  swatchRoles.forEach((clr, i) => {
    ctx.fillStyle = clr;
    ctx.beginPath();
    ctx.arc(widgetX + widgetW - W * 0.16 + i * (swatchW + 5), widgetY + widgetH * 0.5, swatchW / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // 6. Themed App Icons Grid (4 columns x 2 rows)
  const appList = isExpressive
    ? [
        { type: 'phone', label: 'Phone', bg: scheme.primaryContainer, fg: scheme.onPrimaryContainer },
        { type: 'message', label: 'Messages', bg: scheme.secondaryContainer, fg: scheme.onSecondaryContainer },
        { type: 'chrome', label: 'Chrome', bg: scheme.tertiaryContainer, fg: scheme.onTertiaryContainer },
        { type: 'camera', label: 'Camera', bg: scheme.primaryContainer, fg: scheme.primary },
        { type: 'photos', label: 'Photos', bg: scheme.tertiaryContainer, fg: scheme.tertiary },
        { type: 'maps', label: 'Maps', bg: scheme.secondaryContainer, fg: scheme.secondary },
        { type: 'settings', label: 'Settings', bg: scheme.surfaceContainerHighest, fg: scheme.primary },
        { type: 'keep', label: 'Notes', bg: scheme.primaryContainer, fg: scheme.tertiary }
      ]
    : isDark
    ? [
        { type: 'phone', label: 'Phone', bg: scheme.primaryContainer, fg: scheme.onPrimaryContainer },
        { type: 'message', label: 'Messages', bg: scheme.surfaceContainerHighest, fg: scheme.primary },
        { type: 'chrome', label: 'Chrome', bg: scheme.surfaceContainerHighest, fg: scheme.secondary },
        { type: 'camera', label: 'Camera', bg: scheme.surfaceContainerHighest, fg: scheme.onSurface },
        { type: 'photos', label: 'Photos', bg: scheme.surfaceContainerHigh, fg: scheme.tertiary },
        { type: 'maps', label: 'Maps', bg: scheme.surfaceContainerHigh, fg: scheme.primary },
        { type: 'settings', label: 'Settings', bg: scheme.surfaceContainerHigh, fg: scheme.secondary },
        { type: 'keep', label: 'Notes', bg: scheme.surfaceContainerHigh, fg: scheme.onSurface }
      ]
    : [
        { type: 'phone', label: 'Phone', bg: scheme.primaryContainer, fg: scheme.onPrimaryContainer },
        { type: 'message', label: 'Messages', bg: scheme.primaryContainer, fg: scheme.onPrimaryContainer },
        { type: 'chrome', label: 'Chrome', bg: scheme.secondaryContainer, fg: scheme.onSecondaryContainer },
        { type: 'camera', label: 'Camera', bg: scheme.secondaryContainer, fg: scheme.onSecondaryContainer },
        { type: 'photos', label: 'Photos', bg: scheme.tertiaryContainer, fg: scheme.onTertiaryContainer },
        { type: 'maps', label: 'Maps', bg: scheme.surfaceContainerHighest, fg: scheme.primary },
        { type: 'settings', label: 'Settings', bg: scheme.surfaceContainerHighest, fg: scheme.secondary },
        { type: 'keep', label: 'Notes', bg: scheme.primaryContainer, fg: scheme.primary }
      ];

  const cols = 4;
  const gridTop = H * 0.44;
  const cellSize = W * 0.155;
  const gridGapX = (W - W * 0.14 - cellSize * cols) / (cols - 1);
  const rowGapY = H * 0.096;

  appList.forEach((app, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = W * 0.07 + col * (cellSize + gridGapX);
    const y = gridTop + row * rowGapY;
    drawThemedAppIcon(ctx, x, y, cellSize, app.bg, app.fg, app.type, app.label, onSurfaceColor);
  });

  // 7. Authentic Pixel Google Search Pill (Integrated into lower launcher)
  const searchY = H * 0.775;
  const searchH = H * 0.065;
  const searchW = W * 0.86;
  const searchX = W * 0.07;

  ctx.fillStyle = rgba(isExpressive ? scheme.surfaceContainerHigh : scheme.surfaceContainer, 0.94);
  roundRect(ctx, searchX, searchY, searchW, searchH, searchH / 2);
  ctx.fill();
  ctx.strokeStyle = rgba(isExpressive ? scheme.primary : scheme.outlineVariant, isExpressive ? 0.4 : 0.5);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Google G Icon (left)
  drawGoogleG(ctx, searchX + W * 0.065, searchY + searchH / 2, W * 0.024);

  // "Search..." placeholder text
  ctx.fillStyle = onVariantColor;
  ctx.font = `400 ${W * 0.034}px "Roboto", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText('Search your phone & web...', searchX + W * 0.13, searchY + searchH / 2);

  // Mic & Lens icons (right)
  const micX = searchX + searchW - W * 0.13;
  const lensX = searchX + searchW - W * 0.06;
  // Mic
  ctx.fillStyle = scheme.primary;
  roundRect(ctx, micX - 4, searchY + searchH / 2 - 8, 8, 12, 4);
  ctx.fill();
  ctx.strokeStyle = scheme.primary;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(micX, searchY + searchH / 2 - 2, 6, 0, Math.PI);
  ctx.stroke();
  // Lens
  ctx.strokeStyle = isExpressive ? scheme.tertiary : scheme.secondary;
  ctx.lineWidth = 1.6;
  roundRect(ctx, lensX - 8, searchY + searchH / 2 - 7, 14, 14, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(lensX - 1, searchY + searchH / 2, 3, 0, Math.PI * 2);
  ctx.fill();

  // 8. Dock Shelf (Bottom 4 quick apps)
  const dockY = H * 0.865;
  const dockApps = isExpressive
    ? [
        { type: 'phone', bg: scheme.primary, fg: scheme.onPrimary },
        { type: 'message', bg: scheme.secondary, fg: scheme.onSecondary },
        { type: 'chrome', bg: scheme.tertiary, fg: scheme.onTertiary },
        { type: 'camera', bg: scheme.primaryContainer, fg: scheme.onPrimaryContainer }
      ]
    : isDark
    ? [
        { type: 'phone', bg: scheme.primaryContainer, fg: scheme.onPrimaryContainer },
        { type: 'message', bg: scheme.surfaceContainerHighest, fg: scheme.secondary },
        { type: 'chrome', bg: scheme.surfaceContainerHighest, fg: scheme.tertiary },
        { type: 'camera', bg: scheme.surfaceContainerHighest, fg: scheme.primary }
      ]
    : [
        { type: 'phone', bg: scheme.primary, fg: scheme.onPrimary },
        { type: 'message', bg: scheme.secondary, fg: scheme.onSecondary },
        { type: 'chrome', bg: scheme.tertiary, fg: scheme.onTertiary },
        { type: 'camera', bg: scheme.primaryContainer, fg: scheme.onPrimaryContainer }
      ];

  const dockCellSize = W * 0.145;
  const dockGap = (W - W * 0.14 - dockCellSize * 4) / 3;

  dockApps.forEach((app, i) => {
    const x = W * 0.07 + i * (dockCellSize + dockGap);
    drawThemedAppIcon(ctx, x, dockY, dockCellSize, app.bg, app.fg, app.type, '', onSurfaceColor);
  });

  // 9. Android gesture bar
  ctx.fillStyle = rgba(onSurfaceColor, 0.4);
  roundRect(ctx, W * 0.38, H * 0.98, W * 0.24, H * 0.005, 3);
  ctx.fill();
}

/** 5x7 Dot Matrix Font for True Nothing OS typography */
const DOT_5X7 = {
  '0': [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00110, 0b01000, 0b10000, 0b11111],
  '3': [0b01110, 0b10001, 0b00001, 0b00110, 0b00001, 0b10001, 0b01110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  '6': [0b01110, 0b10001, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  '7': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b10001, 0b01110],
  ':': [0b00000, 0b00100, 0b00000, 0b00000, 0b00100, 0b00000, 0b00000],
  ' ': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
  'C': [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  'F': [0b11111, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000, 0b10000],
  '°': [0b01100, 0b10010, 0b10010, 0b01100, 0b00000, 0b00000, 0b00000]
};

function drawDotMatrixString(ctx, text, startX, startY, dotRadius, dotSpacing, activeColor, dimColor) {
  let curX = startX;
  for (let ch of text) {
    const matrix = DOT_5X7[ch] || DOT_5X7[' '];
    for (let row = 0; row < 7; row++) {
      const rowBits = matrix[row];
      for (let col = 0; col < 5; col++) {
        const isSet = (rowBits >> (4 - col)) & 1;
        const x = curX + col * dotSpacing;
        const y = startY + row * dotSpacing;

        if (isSet) {
          ctx.fillStyle = activeColor;
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        } else if (dimColor) {
          ctx.fillStyle = dimColor;
          ctx.beginPath();
          ctx.arc(x, y, dotRadius * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    curX += 6 * dotSpacing;
  }
}

/** Draws a Nothing-OS-style dot-matrix / glyph screen using the palette. */
function drawNothingScreen(ctx, W, H, scheme, themeMode = 'dark') {
  const isExpressive = themeMode === 'expressive';
  const isDark = themeMode === 'dark';

  // 1. OLED pitch black base
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid dot pattern in background for authentic Nothing hardware/OS feel
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  const bgGap = W * 0.055;
  for (let gx = bgGap / 2; gx < W; gx += bgGap) {
    for (let gy = bgGap / 2; gy < H; gy += bgGap) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Dot-matrix status text
  drawStatusBar(ctx, W, H, '#E5E7EB', true);

  // 3. Iconic Nothing OS Dot-Matrix Clock
  const clockStartX = W * 0.08;
  const clockStartY = H * 0.085;
  const dotR = W * 0.007;
  const dotSp = W * 0.018;

  // Active theme color for time
  const clockColor = isExpressive ? scheme.primary : isDark ? scheme.secondary : scheme.primary;
  drawDotMatrixString(ctx, '09:41', clockStartX, clockStartY, dotR, dotSp, clockColor, isExpressive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)');

  // Date in NDot-inspired uppercase mono
  ctx.fillStyle = isExpressive ? scheme.tertiary : 'rgba(255, 255, 255, 0.7)';
  ctx.font = `500 ${W * 0.03}px "Roboto Mono", monospace`;
  ctx.textBaseline = 'top';
  ctx.fillText('TUE 24 OCT', W * 0.08, clockStartY + 8 * dotSp + 4);

  // 4. Quick Toggles Row (Nothing OS Signature Dual Giant Pills)
  const toggleY = H * 0.25;
  const toggleH = H * 0.095;
  const toggleW = (W * 0.86 - W * 0.03) / 2;

  // Left Toggle: Wi-Fi Pill
  const tog1X = W * 0.07;
  if (isExpressive) {
    ctx.fillStyle = scheme.primaryContainer;
    roundRect(ctx, tog1X, toggleY, toggleW, toggleH, toggleH / 2);
    ctx.fill();
    ctx.strokeStyle = rgba(scheme.primary, 0.8);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = scheme.onPrimaryContainer;
    ctx.beginPath();
    ctx.arc(tog1X + toggleW * 0.25, toggleY + toggleH / 2 + 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = scheme.onPrimaryContainer;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tog1X + toggleW * 0.25, toggleY + toggleH / 2 + 4, 9, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tog1X + toggleW * 0.25, toggleY + toggleH / 2 + 4, 15, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();

    ctx.fillStyle = scheme.onPrimaryContainer;
    ctx.font = `600 ${W * 0.03}px "Roboto Mono", monospace`;
    ctx.fillText('INTERNET', tog1X + toggleW * 0.44, toggleY + toggleH * 0.35);
    ctx.font = `400 ${W * 0.024}px "Roboto Mono", monospace`;
    ctx.fillStyle = rgba(scheme.onPrimaryContainer, 0.8);
    ctx.fillText('5G ON', tog1X + toggleW * 0.44, toggleY + toggleH * 0.65);
  } else {
    // Restrained dark toggle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    roundRect(ctx, tog1X, toggleY, toggleW, toggleH, toggleH / 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = scheme.primary;
    ctx.beginPath();
    ctx.arc(tog1X + toggleW * 0.25, toggleY + toggleH / 2 + 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = scheme.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tog1X + toggleW * 0.25, toggleY + toggleH / 2 + 4, 9, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tog1X + toggleW * 0.25, toggleY + toggleH / 2 + 4, 15, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `600 ${W * 0.03}px "Roboto Mono", monospace`;
    ctx.fillText('INTERNET', tog1X + toggleW * 0.44, toggleY + toggleH * 0.35);
    ctx.font = `400 ${W * 0.024}px "Roboto Mono", monospace`;
    ctx.fillStyle = scheme.primary;
    ctx.fillText('5G ON', tog1X + toggleW * 0.44, toggleY + toggleH * 0.65);
  }

  // Right Toggle: Bluetooth Pill
  const tog2X = tog1X + toggleW + W * 0.03;
  if (isExpressive) {
    ctx.fillStyle = rgba(scheme.secondaryContainer, 0.45);
    roundRect(ctx, tog2X, toggleY, toggleW, toggleH, toggleH / 2);
    ctx.fill();
    ctx.strokeStyle = rgba(scheme.secondary, 0.7);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.strokeStyle = scheme.secondary;
    ctx.lineWidth = 2;
    const bx = tog2X + toggleW * 0.25;
    const by = toggleY + toggleH / 2;
    ctx.beginPath();
    ctx.moveTo(bx, by - 12);
    ctx.lineTo(bx, by + 12);
    ctx.lineTo(bx + 7, by + 6);
    ctx.lineTo(bx - 6, by - 5);
    ctx.lineTo(bx + 7, by - 5);
    ctx.lineTo(bx, by + 6);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `600 ${W * 0.03}px "Roboto Mono", monospace`;
    ctx.fillText('AUDIO', tog2X + toggleW * 0.44, toggleY + toggleH * 0.35);
    ctx.font = `400 ${W * 0.024}px "Roboto Mono", monospace`;
    ctx.fillStyle = scheme.secondary;
    ctx.fillText('CONNECTED', tog2X + toggleW * 0.44, toggleY + toggleH * 0.65);
  } else {
    // Restrained dark toggle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    roundRect(ctx, tog2X, toggleY, toggleW, toggleH, toggleH / 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    const bx = tog2X + toggleW * 0.25;
    const by = toggleY + toggleH / 2;
    ctx.beginPath();
    ctx.moveTo(bx, by - 12);
    ctx.lineTo(bx, by + 12);
    ctx.lineTo(bx + 7, by + 6);
    ctx.lineTo(bx - 6, by - 5);
    ctx.lineTo(bx + 7, by - 5);
    ctx.lineTo(bx, by + 6);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `600 ${W * 0.03}px "Roboto Mono", monospace`;
    ctx.fillText('AUDIO', tog2X + toggleW * 0.44, toggleY + toggleH * 0.35);
    ctx.font = `400 ${W * 0.024}px "Roboto Mono", monospace`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('CONNECTED', tog2X + toggleW * 0.44, toggleY + toggleH * 0.65);
  }

  // 5. Glyph Ring Clock & Pedometer Widget (Centerpiece)
  const glyphCardY = H * 0.375;
  const glyphCardH = H * 0.26;
  const glyphCardW = W * 0.86;
  const glyphCardX = W * 0.07;

  // Dark bento container
  ctx.fillStyle = isExpressive ? 'rgba(20, 20, 26, 0.95)' : 'rgba(16, 16, 18, 0.9)';
  roundRect(ctx, glyphCardX, glyphCardY, glyphCardW, glyphCardH, 20);
  ctx.fill();
  ctx.strokeStyle = isExpressive ? rgba(scheme.primary, 0.3) : 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Left: Circular Glyph Dial with illuminated theme segments
  const cx = glyphCardX + glyphCardW * 0.32;
  const cy = glyphCardY + glyphCardH / 2;
  const outerR = glyphCardH * 0.38;

  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const isMajor = i % 5 === 0;
    const r1 = outerR - (isMajor ? W * 0.028 : W * 0.014);
    const r2 = outerR;
    const isLit = i <= 42; // Progress fill

    ctx.strokeStyle = isLit ? scheme.primary : 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = isExpressive ? (isMajor ? 3 : 1.8) : (isMajor ? 2.2 : 1.2);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    ctx.stroke();
  }

  // Center dot in primary (Dark) or secondary (Expressive)
  ctx.fillStyle = isExpressive ? scheme.secondary : scheme.primary;
  ctx.beginPath();
  ctx.arc(cx, cy, W * 0.018, 0, Math.PI * 2);
  ctx.fill();

  // Right info panel inside Glyph Card
  const infoX = glyphCardX + glyphCardW * 0.62;
  ctx.fillStyle = isExpressive ? scheme.tertiary : 'rgba(255, 255, 255, 0.4)';
  ctx.font = `600 ${W * 0.024}px "Roboto Mono", monospace`;
  ctx.fillText(isExpressive ? 'GLYPH · EXPRESSIVE' : 'GLYPH MATRIX', infoX, glyphCardY + glyphCardH * 0.28);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 ${W * 0.055}px "Roboto Mono", monospace`;
  ctx.fillText('8,420', infoX, glyphCardY + glyphCardH * 0.48);

  ctx.fillStyle = scheme.primary;
  ctx.font = `600 ${W * 0.026}px "Roboto Mono", monospace`;
  ctx.fillText('STEPS · 72%', infoX, glyphCardY + glyphCardH * 0.68);

  // Micro progress indicator bar
  roundRect(ctx, infoX, glyphCardY + glyphCardH * 0.78, W * 0.24, 3, 1.5);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fill();
  roundRect(ctx, infoX, glyphCardY + glyphCardH * 0.78, W * 0.17, 3, 1.5);
  ctx.fillStyle = isExpressive ? scheme.tertiary : scheme.primary;
  ctx.fill();

  // 6. Dual Bento Micro-Widgets (Weather & Palette)
  const bentoY = H * 0.66;
  const bentoH = H * 0.15;
  const bentoW = (glyphCardW - W * 0.03) / 2;

  // Weather Card
  if (isExpressive) {
    ctx.fillStyle = rgba(scheme.secondaryContainer, 0.35);
    roundRect(ctx, tog1X, bentoY, bentoW, bentoH, 18);
    ctx.fill();
    ctx.strokeStyle = rgba(scheme.secondary, 0.55);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = scheme.onSecondaryContainer || '#FFFFFF';
    ctx.font = `600 ${W * 0.024}px "Roboto Mono", monospace`;
    ctx.fillText('WEATHER', tog1X + W * 0.04, bentoY + bentoH * 0.26);

    drawDotMatrixString(ctx, '24°C', tog1X + W * 0.04, bentoY + bentoH * 0.45, W * 0.005, W * 0.012, scheme.secondary, null);

    ctx.fillStyle = rgba(scheme.onSecondaryContainer, 0.7);
    ctx.font = `400 ${W * 0.022}px "Roboto Mono", monospace`;
    ctx.fillText('LONDON · CLEAR', tog1X + W * 0.04, bentoY + bentoH * 0.85);
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    roundRect(ctx, tog1X, bentoY, bentoW, bentoH, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = `500 ${W * 0.024}px "Roboto Mono", monospace`;
    ctx.fillText('WEATHER', tog1X + W * 0.04, bentoY + bentoH * 0.26);

    drawDotMatrixString(ctx, '24°C', tog1X + W * 0.04, bentoY + bentoH * 0.45, W * 0.005, W * 0.012, scheme.secondary, null);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = `400 ${W * 0.022}px "Roboto Mono", monospace`;
    ctx.fillText('LONDON · CLEAR', tog1X + W * 0.04, bentoY + bentoH * 0.85);
  }

  // Palette Accent Card
  if (isExpressive) {
    ctx.fillStyle = rgba(scheme.tertiaryContainer, 0.38);
    roundRect(ctx, tog2X, bentoY, bentoW, bentoH, 18);
    ctx.fill();
    ctx.strokeStyle = rgba(scheme.tertiary, 0.55);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = scheme.onTertiaryContainer || '#FFFFFF';
    ctx.font = `600 ${W * 0.024}px "Roboto Mono", monospace`;
    ctx.fillText('PALETTE TONES', tog2X + W * 0.04, bentoY + bentoH * 0.26);

    ctx.fillStyle = scheme.tertiary;
    ctx.font = `700 ${W * 0.048}px "Roboto Mono", monospace`;
    ctx.fillText('EXPRESSIVE', tog2X + W * 0.04, bentoY + bentoH * 0.58);

    ctx.fillStyle = rgba(scheme.onTertiaryContainer, 0.7);
    ctx.font = `400 ${W * 0.022}px "Roboto Mono", monospace`;
    ctx.fillText('ACCENTS ACTIVE', tog2X + W * 0.04, bentoY + bentoH * 0.85);
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    roundRect(ctx, tog2X, bentoY, bentoW, bentoH, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = `500 ${W * 0.024}px "Roboto Mono", monospace`;
    ctx.fillText('PALETTE TONES', tog2X + W * 0.04, bentoY + bentoH * 0.26);

    ctx.fillStyle = scheme.tertiary;
    ctx.font = `700 ${W * 0.048}px "Roboto Mono", monospace`;
    ctx.fillText('MONET', tog2X + W * 0.04, bentoY + bentoH * 0.58);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = `400 ${W * 0.022}px "Roboto Mono", monospace`;
    ctx.fillText('ACCENTS SYNCED', tog2X + W * 0.04, bentoY + bentoH * 0.85);
  }

  // 7. Nothing OS Circular Monochrome Apps Dock with Theme Accents
  const appDockY = H * 0.855;
  const appDockSize = W * 0.15;
  const appDockGap = (glyphCardW - appDockSize * 4) / 3;

  for (let a = 0; a < 4; a++) {
    const ax = glyphCardX + a * (appDockSize + appDockGap);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.arc(ax + appDockSize / 2, appDockY + appDockSize / 2, appDockSize / 2, 0, Math.PI * 2);
    ctx.fill();

    let strokeClr = 'rgba(255, 255, 255, 0.15)';
    let iconColor = '#FFFFFF';
    if (isExpressive) {
      if (a === 0) { strokeClr = scheme.primary; iconColor = scheme.primary; }
      else if (a === 1) { strokeClr = scheme.secondary; iconColor = scheme.secondary; }
      else if (a === 2) { strokeClr = scheme.tertiary; iconColor = scheme.tertiary; }
      else { strokeClr = 'rgba(255, 255, 255, 0.3)'; iconColor = '#FFFFFF'; }
    } else {
      if (a === 0) { strokeClr = scheme.primary; iconColor = scheme.primary; }
    }

    ctx.strokeStyle = strokeClr;
    ctx.lineWidth = isExpressive ? 1.5 : 1;
    ctx.stroke();

    const acx = ax + appDockSize / 2;
    const acy = appDockY + appDockSize / 2;

    ctx.fillStyle = iconColor;
    ctx.strokeStyle = iconColor;
    ctx.lineWidth = 2;

    if (a === 0) {
      ctx.beginPath();
      ctx.arc(acx, acy, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (a === 1) {
      roundRect(ctx, acx - 9, acy - 6, 18, 13, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(acx, acy, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (a === 2) {
      for (let s = -2; s <= 2; s++) {
        const barH = 5 + Math.abs(s) * 4;
        ctx.fillRect(acx + s * 4, acy - barH / 2, 2, barH);
      }
    } else {
      ctx.beginPath();
      ctx.arc(acx, acy, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(acx, acy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 8. Navigation gesture pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  roundRect(ctx, W * 0.38, H * 0.98, W * 0.24, H * 0.005, 3);
  ctx.fill();
}

/**
 * Renders a phone-screen mockup ("pixel" | "nothing") for the given palette
 * and returns a PNG data URL suitable for feeding into <TiltedCard imageSrc>.
 */
export function renderPhoneMockup(scheme, variant = 'pixel', themeMode = 'dark', width = 600, height = 1250) {
  if (typeof themeMode === 'number') {
    height = width || 1250;
    width = themeMode;
    themeMode = 'dark';
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (variant === 'nothing') {
    drawNothingScreen(ctx, width, height, scheme, themeMode);
  } else {
    drawPixelScreen(ctx, width, height, scheme, themeMode);
  }

  return canvas.toDataURL('image/png');
}
