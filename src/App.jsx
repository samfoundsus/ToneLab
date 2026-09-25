import { useCallback, useEffect, useMemo, useState } from 'react';
import TopAppBar from './components/sections/TopAppBar';
import Hero from './components/sections/Hero';
import UploadSection from './components/sections/UploadSection';
import PhonePreview from './components/sections/PhonePreview';
import ColorRoles from './components/sections/ColorRoles';
import ExportSection from './components/sections/ExportSection';
import Footer from './components/sections/Footer';
import BottomDock from './components/BottomDock';
import SettingsModal from './components/SettingsModal';
import Toast from './components/ui/Toast';
import { useMaterialTheme } from './hooks/useMaterialTheme';
import { useToast } from './hooks/useToast';
import { useActiveSection } from './hooks/useActiveSection';
import { getContrastTextColor } from './utils/colorUtils';
import './App.css';

export default function App() {
  const {
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
  } = useMaterialTheme();

  const { toastMessage, toastKey, showToast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const activeSection = useActiveSection(['hero', 'upload', 'preview', 'themes', 'roles', 'export']);

  useEffect(() => {
    if (restoredFromShare) showToast('Palette restored from shared link');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoredFromShare]);

  const scrollToId = useCallback((id) => {
    if (id === 'themes') {
      const el = document.getElementById('themes') || document.getElementById('preview');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToUpload = useCallback(() => scrollToId('upload'), [scrollToId]);

  const handleFileSelected = useCallback(
    (file) => {
      generateFromImage(file);
    },
    [generateFromImage]
  );

  const handleResetPalette = useCallback(() => {
    resetAllOverrides();
    showToast('Palette reset');
  }, [resetAllOverrides, showToast]);

  // Softer, container-level tones read as a calm tonal wash rather than a
  // saturated glow, while still tracking the generated palette. Memoized so
  // Hero (which drives the WebGL Aurora background) doesn't get a "new"
  // array — and therefore doesn't bail out of React.memo — on every render
  // that has nothing to do with the palette.
  const auroraColors = useMemo(
    () => [activeScheme.primaryContainer, activeScheme.tertiaryContainer, activeScheme.secondaryContainer],
    [activeScheme]
  );
  const heroTextColor = getContrastTextColor(activeScheme.background);

  return (
    <div className="app-shell">
      <TopAppBar onNavigate={scrollToId} activeSection={activeSection} />

      <main>
        <Hero
          auroraColors={auroraColors}
          onGetStarted={scrollToUpload}
          themeMode={themeMode}
          textColor={heroTextColor}
          scheme={activeScheme}
        />

        <UploadSection
          onFileSelected={handleFileSelected}
          onClear={clearImage}
          sourceImage={sourceImage}
          status={status}
          errorMessage={errorMessage}
          spotlightColor={`${activeScheme.primary}14`}
        />

        <PhonePreview scheme={activeScheme} themeMode={themeMode} onThemeChange={setThemeMode} />

        <ColorRoles
          scheme={activeScheme}
          rawScheme={activeRawScheme}
          overrides={activeOverrides}
          hasEditedRoles={hasEditedRoles}
          themeMode={themeMode}
          onColorChange={setRoleColor}
          onColorReset={resetRoleColor}
          onResetPalette={handleResetPalette}
          onNotify={showToast}
        />

        <ExportSection
          scheme={activeScheme}
          themeMode={themeMode}
          buildShareLink={buildShareLink}
          onNotify={showToast}
        />
      </main>

      <Footer />

      <BottomDock onNavigate={scrollToId} onSettings={() => setSettingsOpen(true)} activeSection={activeSection} />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onResetWallpaper={() => {
          clearImage();
          setSettingsOpen(false);
        }}
        sourceImage={sourceImage}
      />

      {toastMessage && <Toast key={toastKey} message={toastMessage} />}
    </div>
  );
}
