# Material You Studio

Generate beautiful **Material Design 3** color palettes from any wallpaper — right in your browser. Built with React, Vite, and ten [React Bits](https://reactbits.dev) components for a premium, Android‑16‑style "Material Expressive" feel.

## What's new in V3.1 — responsive layout repair

A bug-fix release only: no new features, no visual redesign.

- **Explicit width chain from the root down.** `html`, `body`, `#root`, and `.app-shell` never had explicit width rules — they worked by default block-level behavior, but were never actually audited. All four now explicitly declare `width: 100%`, closing that gap rather than leaving it implicit.
- **Phone Preview now uses explicit CSS Grid breakpoints** (1 column below 768px, 2 from 768px, 3 from 1024px) using `minmax(0, 1fr)` tracks instead of relying on flex-wrap alone — `minmax(0, ...)` specifically is what stops a grid item from being forced wider than its column on narrow screens. All existing functionality (Pixel/Nothing OS/Material Android previews, Light/Dark/Expressive switching, tilt/hover) is untouched — only the CSS controlling how the three stages lay out was rebuilt.
- **Mobile container padding** bumped from 16px to 20px specifically below 768px (via a scoped media query, not by changing the shared spacing token used elsewhere), matching a comfortable 20-24px mobile margin on every section.
- I audited the entire CSS codebase for the specific failure patterns named in the report (stray `%` widths, `vw` usage, `transform: scale` on layout containers, `flex-basis`, `calc()`, `grid-template-columns`, `min-width`) and found nothing else outside what's described above.

## What's new in V3.0 — a real Material You design tool

V3 turns the generator into an editable, verifiable, exportable design tool, without adding a second theme system, a backend, or palette history.

- **Every role is now editable.** Added the two roles that existed in the palette engine but weren't exposed in the editor (On Tertiary Container, On Error Container) — all 27 Material 3 roles listed in the spec are now on the grid.
- **Reset Palette.** A new "Reset palette" action (shown only once you've actually edited something) clears every manual edit for the current theme mode and restores the generated colors — without touching your uploaded wallpaper. The existing per-role reset in the color editor is unchanged.
- **Richer wallpaper analysis.** `extractPaletteSeeds` (in `colorUtils.js`) now looks for a genuine second *accent* color — the best-scoring color bucket whose hue is meaningfully different (≥40°) from the dominant one — in the same single bucket-scan pass used before (no extra image processing). When a wallpaper actually contains two distinct colors, Tertiary is now anchored to the real accent instead of always being a fixed +60° hue rotation; monochromatic wallpapers fall back to the previous algorithmic behavior exactly.
- **A third phone preview — "Material Android".** A generic Material 3 app screen (app bar, list cards, FAB, navigation bar) alongside the existing Pixel and Nothing OS previews. Deliberately built as plain DOM + inline styles instead of a canvas mockup, so it updates on every palette change via ordinary React re-rendering, with no redraw/regeneration step at all.
- **Instant Light/Dark/Expressive preview switching**, exposed as chips right in the phone preview section — reuses the exact same `themeMode` state as the Themes section (no second switcher, no wallpaper reprocessing).
- **Accessibility panel.** WCAG contrast ratios and AA/AAA badges for every foreground/background pair that actually appears in the UI. Failing pairs that trace back to a manual edit get a one-click "use generated color" suggestion — never applied automatically.
- **Export All (.zip)**, plus per-button "Downloaded" confirmation on every format button. The ZIP is written by a small hand-rolled STORE-format writer (`zipUtils.js`) — no new dependency — reusing the exact same content-builder functions as the individual export buttons, so the ZIP's contents are guaranteed to match what each button produces alone.
- **Share Palette 2.0.** The share text now includes the palette name, theme, and key hex values (not just a bare link), and the accent color is included in the share payload so a restored link reproduces the exact same Tertiary hue.
- **A real desktop workspace**, scoped narrowly: at ≥1200px, the color-role grid and the new accessibility panel sit side by side (edit + verify together) instead of stacked. Everything else keeps its existing layout — no risky full-page restructure.

## What's new in V2.2 — ambient hero background + polish

- **Desktop hero no longer reads as an empty black rectangle.** Added a dedicated, desktop/tablet-only ambient lighting layer (`.hero__ambient`, one extra `<div>`, pure `radial-gradient()`, no filter/blur/canvas/WebGL) that spreads Primary/Tertiary/Secondary-tinted light toward the edges on wide viewports. It renders nothing at all below 900px, so mobile — which was already working well — is untouched.
- Softened the hero's existing scrim (it was fading to fully solid background by 78% of the way to the corner, which was quietly painting over anything placed near the edges) so both the new ambient layer and the existing Aurora read through properly on wide screens, without changing how the text itself looks.
- Both the ambient layer and the scrim consume the *existing* `--md-sys-color-primary/secondary/tertiary/background` custom properties — no second palette system, no new state. Before a wallpaper is uploaded they show the default seed's restrained tones; after upload they follow the generated palette automatically, transitioning smoothly (~500ms) like every other themed surface in the app.
- Tied the Hero CTA's specular shine color to the same contrast-computed value used for the heading text (was a hardcoded `#ffffff`) — one less hardcoded color outside the theme system.
- Added active/pressed feedback to the top app bar's nav buttons and brand mark, and widened the hero subtitle's measure slightly at large desktop widths to match the bigger heading.

## What's new in V2.1 — performance & polish

No new features, no visual redesign — this pass is entirely about making the app feel smoother, especially on mid-range Android phones.

- **Modal scroll-lock**: opening Settings or the color editor now locks background scroll. Fixes a real bug (not just a nice-to-have): the Settings scrim uses a small `backdrop-filter` blur, which — without a scroll lock — would have had to keep resampling the page underneath it on every scroll frame while open.
- **Fewer redundant re-renders**: `Hero` and `PhonePreview` (the two components with genuinely expensive internals — WebGL and canvas, respectively) are now wrapped in `React.memo`, with their array/callback props stabilized via `useMemo`/`useCallback` in `App.jsx` so the memoization actually takes effect.
- **One-pass wallpaper processing**: large images are now downscaled once into an intermediate canvas, and the seed color is sampled from that same canvas — instead of downscaling for preview and separately re-touching the full-resolution image again for color extraction.
- **Passive pointermove listener** on `SpecularButton`, so it can never block scroll/touch handling even if it fires during a touch gesture.
- Removed one genuinely dead utility function (`contrastRatio`, unused).

## What's new in V2

- **Manual color editing** — click the pencil on any role card to open a compact editor (hex input, native color picker, copy, reset-to-generated). Edits update the UI, the phone previews and every export format immediately.
- **Shareable palette links** — "Share Palette" encodes the seed color, theme mode and any manual edits into a compact URL (native share sheet on mobile, clipboard fallback elsewhere). No backend, no account — opening the link recreates the exact palette. The original wallpaper image is never encoded, only the derived colors.
- **Smarter wallpaper pipeline** — large photos are decoded once, sampled directly for the seed color, and only re-encoded into a smaller preview copy when they're larger than needed for display. Object URLs are revoked as soon as they're no longer needed instead of holding a full-resolution base64 copy in memory.
- **Remove/Clear** wallpaper control alongside Upload/Browse/Replace.
- **Performance pass**: removed `backdrop-filter` from the always-visible-during-scroll App Bar and Dock, swapped blurred decorative shapes for cheap `radial-gradient`s, paused the WebGL Aurora/Specular-button render loops when scrolled off-screen, replaced six of seven WebGL export buttons with a plain CSS button (cutting concurrent WebGL contexts from 8 to 2), debounced color-editor commits, `React.memo`'d the 26-times-repeated role card, and switched the App Bar's scroll listener to an rAF-throttled hook that only re-renders on an actual state change.
- Minor Material‑3 tonal‑generation tuning (hue‑aware saturation correction so yellow/green source colors don't read as neon).

## ✨ Features

- **Drag & drop wallpaper upload** (JPG, PNG, JPEG, WEBP) with progress, preview, replace and remove
- **On‑device color extraction** — a canvas‑based quantizer picks a vibrant "source color" *and* (when the wallpaper has one) a genuinely distinct accent color; nothing is uploaded to a server
- **Full Material 3 role generation** for **Light**, **Dark**, and **Expressive** schemes — all 27 roles from the spec, including every "On-X" pairing
- **Manual color editing** per role, with reset-to-generated and a one-click "Reset palette" for all edits at once
- **Accessibility panel** — WCAG contrast ratios and AA/AAA badges for every role pair used as text-on-surface
- **Shareable palette URLs**, with a readable text summary (title, theme, key hex values) for the native share sheet / clipboard
- **Three live phone previews** — Pixel, Nothing OS, and a generic Material Android app screen — all re‑rendered instantly from your palette, including instant Light/Dark/Expressive switching
- **Theme switching** with a pixel‑dissolve transition
- **One‑click copy** on every color swatch, with a ripple + toast confirmation
- **Seven export formats** (HEX list, JSON, CSS custom properties, Android XML, Tailwind config, Flutter `ColorScheme`, Figma design tokens) plus **Export All** as a single .zip — all reflect manual edits
- A floating **Dock** for quick navigation between sections
- A **desktop workspace layout** for editing + verifying colors side by side at wide viewports; fully responsive, mobile‑first everywhere else

## 🎨 Visual language

The app deliberately avoids "AI-generated landing page" tropes — no neon glow, no floating particles, no heavy glassmorphism. Instead:

- Every surface (page background, cards, nav bar, dock, buttons, borders) is driven by CSS custom properties written by the palette engine, so the **whole UI**, not just the swatches, reflects your wallpaper.
- A small `BackgroundLayer` component adds two or three large, very low‑opacity, asymmetrically‑shaped tonal gradients inside a few open sections (Hero, Phone Preview, Themes) — Material 3 Expressive shape language used as ambience, not decoration competing with content.
- Palette changes (new wallpaper, new theme, manual edits) animate over ~450ms with a standard Material easing curve instead of hard‑cutting, similar to Android's dynamic‑color transition.
- The Hero's text color is computed for contrast against the generated background automatically, so Light, Dark and Expressive schemes all stay readable.
- Elevation and "glow" effects are intentionally restrained, and `backdrop-filter` is reserved for elements that aren't on-screen during scrolling (see Performance below).

## ⚡ Performance notes

- **No `backdrop-filter` on scroll-persistent elements.** The App Bar and Dock are `position: fixed` and visible for the entire scroll — a blur there forces the browser to resample the page underneath on every frame. Both now use a near-solid tonal fill instead.
- **Gradients instead of blurred shapes.** The ambient background shapes use `radial-gradient` (computed analytically) instead of a solid fill + `filter: blur()` (a full GPU filter pass), repeated across three section instances.
- **WebGL loops pause off-screen.** Aurora (Hero) and SpecularButton (Hero CTA, Share button) use `IntersectionObserver` to skip their per-frame uniform updates and draw call once scrolled out of view, instead of rendering forever regardless of visibility.
- **Fewer WebGL buttons.** Export actions use a plain CSS `MaterialButton`; only the Hero CTA and Share Palette keep the WebGL shine effect.
- **Debounced color commits.** Dragging the native color picker or typing a hex value updates the editor's own preview instantly, but the app-wide commit (CSS variables + phone-mockup canvas redraw) is debounced ~90ms.
- **`React.memo` on `ColorRoleCard`.** Editing one role no longer re-renders the other 25 cards.
- **rAF-throttled scroll listener.** The App Bar's "scrolled" state only triggers a re-render when it actually flips, not on every scroll tick.

## 🧩 React Bits components used

Aurora · SplitText · BlurText · FadeContent · AnimatedContent · SpotlightCard · TiltedCard · PixelTransition · Dock · SpecularButton

Each component is used exactly as documented, with only props adjusted for this app's theme.

## 🛠 Tech stack

- React 18 + Vite
- Plain CSS with a Material 3 design‑token system (`src/styles/tokens.css`)
- [gsap](https://gsap.com) + `@gsap/react` (scroll reveals, text splitting)
- [motion](https://motion.dev) (spring‑based interactions)
- [ogl](https://github.com/oframe/ogl) (lightweight WebGL for Aurora & SpecularButton)
- [lucide-react](https://lucide.dev) (icons)

## 🚀 Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## 📁 Project structure

```
src/
  components/
    reactbits/     # The 10 React Bits components, used verbatim
    sections/      # Page sections (Hero, Upload, Preview, Themes, Colors, Export, Footer, TopAppBar)
    ui/            # Smaller reusable pieces (ColorRoleCard, ColorEditorModal, AccessibilityPanel,
                   # MaterialAndroidPreview, MaterialButton, Toast)
    BottomDock.jsx  # Wraps <Dock/> with app navigation items
    BackgroundLayer.jsx
    SettingsModal.jsx
  hooks/
    useMaterialTheme.js       # Seed/accent extraction + palette + overrides + share hydration + live CSS vars
    useDebouncedCallback.js   # Debounces expensive commits (color editing)
    useScrolledPast.js        # rAF-throttled scroll-threshold hook
    useBodyScrollLock.js       # Locks page scroll while a modal is open
    useToast.js                # Shared toast/notification state
  utils/
    colorUtils.js         # RGB/HSL/HEX conversions, dominant + accent color extraction, WCAG contrast
    materialPalette.js    # Material 3 tonal ramps + role mapping + override merging + contrast pairs
    exportUtils.js         # File/clipboard export helpers + content builders shared with Export All
    zipUtils.js              # Minimal dependency-free ZIP (STORE) writer, used by Export All
    phoneMockup.js          # Canvas-drawn Pixel / Nothing OS phone mockups
    imageProcessing.js      # Wallpaper decode/downscale pipeline
    share.js                 # URL-safe palette encode/decode + share text builder
  styles/
    tokens.css            # Material 3 CSS custom properties, type scale, elevation
  App.jsx
  main.jsx
```

## 🎨 How the palette is generated

1. The uploaded image is decoded once (via an object URL, not a giant base64 string), then drawn onto a small offscreen canvas and its pixels are quantized into coarse RGB buckets.
2. Buckets are scored by population, saturation, and mid‑range lightness to find a vibrant, representative **source color**.
3. From that source color's hue and saturation, Material You Studio derives Primary / Secondary / Tertiary / Neutral / Neutral‑Variant tonal ramps (an HSL‑based approximation of Material's HCT tonal system), with a hue‑aware saturation correction so yellow/green hues don't overshoot into neon territory.
4. Each Material 3 **role** (Primary, On Primary, Primary Container, Surface, Outline, …) is mapped onto a specific tone on the appropriate ramp, separately for Light, Dark, and Expressive schemes.
5. Any manually-edited roles are layered on top as a sparse override map, per theme mode.
6. The active (merged) scheme is written to CSS custom properties on `:root`, so the entire UI — including the exported files and shared links — reflects your wallpaper and your edits live.

## 🔗 Sharing a palette

"Share Palette" (in the Export section) encodes `{ seed color, accent color, theme mode, manual edits }` as a base64url string in the `?p=` query parameter — nothing else, no image data. On mobile/supporting browsers this opens the native share sheet with a readable text summary (palette name, theme, key hex values) alongside the link; otherwise both are copied to your clipboard. Opening a shared link decodes and re-generates the exact same palette client-side. Malformed or tampered links are ignored gracefully (the app just falls back to its default palette) rather than crashing.

## 📦 Exports

| Format | What you get |
|---|---|
| Copy HEX | All role → hex pairs copied to your clipboard |
| JSON | `{ scheme, colors }` object |
| CSS Variables | `:root { --md-sys-color-* }` |
| Android XML | `<resources><color name="md_..."/></resources>` |
| Tailwind Config | `theme.extend.colors.materialYou` |
| Flutter Theme | A ready‑to‑use `ColorScheme(...)` |
| Figma Tokens | A tokens‑studio‑style JSON file |
| Export All | A `.zip` containing all six file-based formats above |

All exports reflect the current scheme, including any manual color edits. The ZIP is built by a small hand-rolled writer (`src/utils/zipUtils.js`, STORE/no-compression format) — no new dependency was added for this.

---

No placeholders, no incomplete sections, no backend — install and run.
