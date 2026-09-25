# ToneLab

### Material You-inspired color studio for wallpaper-based dynamic color palettes.

ToneLab is a modern color design tool that extracts a Material You-inspired color system from any wallpaper and turns it into a complete, editable design palette.

Upload a wallpaper, generate a dynamic color system, preview it across different Android-inspired interfaces, edit individual semantic roles, check accessibility, and export the palette for your projects.

---

## ✨ Features

### 🎨 Wallpaper Color Extraction

Upload a wallpaper and generate a dynamic color palette from its visual characteristics.

- Supports portrait, landscape, square and panoramic images
- Supports common image formats such as JPG, PNG, WebP and more
- No fixed aspect-ratio requirement
- Wallpaper-derived palette becomes the source of truth for the entire studio
- Automatic Material 3-inspired semantic color roles

---

### 🎛️ Material Color System

ToneLab converts extracted colors into a structured semantic color system.

The palette includes roles such as:

- Primary
- On Primary
- Primary Container
- On Primary Container
- Secondary
- On Secondary
- Secondary Container
- On Secondary Container
- Tertiary
- On Tertiary
- Tertiary Container
- On Tertiary Container
- Background
- On Background
- Surface
- On Surface
- Surface Variant
- On Surface Variant
- Surface Tint
- Outline
- Outline Variant
- Error
- On Error
- Error Container
- On Error Container
- Inverse Surface
- Inverse On Surface
- Inverse Primary

Every semantic role can be edited individually.

---

## 📱 Interactive Preview

Preview the generated color system inside Android-inspired interfaces.

### Pixel-inspired

A clean, minimal Material You-inspired interface focused on dynamic color and tonal surfaces.

### Nothing-inspired

A monochrome, minimal interface inspired by glyph-based and utility-focused visual language.

### Material Android

A generic Material 3 Android interface demonstrating how the generated color system can be applied to a modern Android UI.

The preview updates automatically whenever the palette changes.

---

## 🌗 Theme Modes

ToneLab supports multiple color presentation modes:

### Light

Bright tonal surfaces with the generated palette applied throughout the interface.

### Dark

A restrained dark color system with deeper surfaces and controlled color usage.

### Expressive

A more colorful interpretation of the same extracted palette with stronger use of primary, secondary and tertiary roles.

All modes continue to use the same generated semantic color system.

---

## 🎨 Color Studio

The Color Studio provides a structured view of the complete generated palette.

Colors can be filtered by category:

- All Roles
- Primary
- Secondary
- Tertiary
- Surfaces & Background
- Outline
- System
- Inverse

Each color role provides:

- Color preview
- Semantic role name
- HEX value
- Copy action
- Edit action

Manual changes are reflected across the entire application.

---

## ♿ Accessibility

ToneLab includes contrast checking for important foreground/background combinations.

Each contrast pair displays:

- Foreground color
- Background color
- Contrast ratio
- WCAG compliance
- AA / AAA status

Accessibility results update automatically when colors are edited.

---

## 📤 Export

Export the current color system for use in other projects.

Supported formats include:

- JSON
- CSS Variables
- Android XML
- Tailwind
- Flutter
- Figma Tokens
- ZIP package

Exports use the current palette, including manual color edits and the active color configuration.

---

## 📋 Copy & Share

ToneLab makes it easy to move generated colors into another project.

### Copy

Copy individual HEX values directly from the Color Studio.

### Copy All

Copy the complete palette for quick use in design or development workflows.

### Share

Share the current palette while preserving the generated color configuration.

---

## 🖼️ Image Handling

ToneLab is designed to work with wallpapers of different sizes and proportions.

Supported image scenarios include:

- Portrait wallpapers
- Landscape wallpapers
- Square images
- Ultra-wide wallpapers
- Very tall wallpapers
- Large-resolution images
- Transparent images where supported
- Different common image formats supported by the browser

The original image is preserved for color extraction while internal processing can use an optimized representation when necessary.

---

## 🎨 Design Philosophy

ToneLab follows a simple visual philosophy:

> **The wallpaper creates the color system. The color system creates the interface.**

The application avoids unnecessary visual effects and focuses on:

- Solid tonal surfaces
- Semantic Material color roles
- Clear hierarchy
- Minimal borders
- Restrained shadows
- Dynamic color
- Consistent spacing
- Responsive layouts
- Accessibility

The interface intentionally avoids excessive gradients, aurora backgrounds and decorative visual noise.

---

## 🧠 Dynamic Color Architecture

The extracted wallpaper palette acts as the central source of truth.

Changing a semantic color role updates the relevant parts of the application automatically.
This keeps the preview, accessibility results and exported tokens synchronized

🛠️ Tech Stack
ToneLab is built with modern frontend technologies.
React
Vite
JavaScript
Tailwind CSS
Framer Motion
Material Color Utilities
html2canvas
FileSaver.js
shadcn/ui
ReactBits


📂 Project Structure
ToneLab/
├── public/
├── src/
│   ├── components/
│   │   ├── Hero
│   │   ├── Upload
│   │   ├── Preview
│   │   ├── Color Studio
│   │   ├── Accessibility
│   │   ├── Export
│   │   └── Navigation
│   │
│   ├── hooks/
│   ├── utils/
│   ├── App.jsx
│   └── App.css
│
├── index.html
├── package.json
├── vite.config.js
└── README.md


🚀 Getting Started
1. Clone the repository
git clone <repository-url>
2. Enter the project directory
cd ToneLab
3. Install dependencies
npm install
4. Start the development server
npm run dev
The application will be available through the local Vite development server.

🏗️ Production Build
Create a production build with:
npm run build
Preview the production build locally:
npm run preview
📱 Responsive Design
ToneLab is designed for:
Mobile phones
Tablets
Laptops
Desktop displays
The interface adapts its layout depending on available screen space.
Examples include:
Responsive navigation
Mobile-friendly upload area
Adaptive color grids
Responsive contrast cards
Mobile preview presentation
Touch-friendly controls
Safe-area aware bottom navigation


🔄 Application Flow
The main workflow is intentionally simple:
1. Upload Wallpaper
        ↓
2. Extract Dynamic Colors
        ↓
3. Preview Color System
        ↓
4. Edit Semantic Roles
        ↓
5. Check Accessibility
        ↓
6. Export Palette


🎯 Use Cases
ToneLab can be useful for:
Android UI designers
Frontend developers
UI/UX designers
Design system creation
Material 3 experimentation
Wallpaper-based theming
Color palette generation
Accessibility testing
Design token generation
Rapid UI prototyping

🔐 Privacy
ToneLab is designed around local browser-based processing wherever possible.
Your wallpaper is used for generating the color system within the application workflow.
The project does not require an account simply to experiment with palettes.

🧩 Design System
ToneLab uses semantic tokens instead of scattering hard-coded colors throughout the interface.
For example:
--primary
--on-primary
--primary-container
--on-primary-container

--secondary
--on-secondary
--secondary-container
--on-secondary-container

--background
--on-background

--surface
--on-surface

--surface-variant
--on-surface-variant

--outline
--outline-variant
This allows the entire interface to respond consistently when the palette changes.


🌐 Deployment
ToneLab can be deployed using modern frontend hosting platforms such as Vercel.
A typical deployment workflow is:
Local Development
        ↓
Git
        ↓
GitHub
        ↓
Vercel
        ↓
Production
Pushes to the production branch can be connected to automatic deployments.


🗺️ Roadmap
Potential future improvements include:
More preview environments
More export formats
Advanced palette controls
Additional accessibility tools
Improved color editing
More Android-inspired UI previews
Saved palettes
Palette history
Custom design-token presets
Advanced sharing options


🤝 Contributing
Contributions, ideas and improvements are welcome.
If you want to contribute:
Fork the repository
Create a feature branch
Make your changes
Test the application
Open a pull request
Please keep contributions consistent with the project's design philosophy and avoid unnecessary visual complexity.


📄 License
Add your preferred license here.
For example:
MIT License

Built with ToneLab
ToneLab is an exploration of dynamic color, Material-inspired design systems and wallpaper-driven theming.
Upload. Extract. Customize. Preview. Export.
