import { useCallback, useRef, useState } from 'react';
import { FileJson, FileCode2, FileText, Braces, Smartphone, Layers, Copy, Check, Share2, PackageCheck, FolderArchive } from 'lucide-react';
import SpecularButton from '../reactbits/SpecularButton';
import MaterialButton from '../ui/MaterialButton';
import FadeContent from '../reactbits/FadeContent';
import AnimatedContent from '../reactbits/AnimatedContent';
import {
  copyToClipboard,
  exportJSON,
  exportCSSVariables,
  exportAndroidXML,
  exportTailwindConfig,
  exportFlutterTheme,
  exportFigmaTokens,
  exportAllAsZip
} from '../../utils/exportUtils';
import { buildShareText } from '../../utils/share';
import './ExportSection.css';

const DOWNLOADED_FEEDBACK_MS = 1500;

export default function ExportSection({ scheme, themeMode, buildShareLink, onNotify }) {
  const [copied, setCopied] = useState(false);
  const [justDownloaded, setJustDownloaded] = useState(null); // format key, transient
  const [exportingAll, setExportingAll] = useState(false);
  const downloadTimerRef = useRef(null);

  const flashDownloaded = useCallback((key) => {
    if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current);
    setJustDownloaded(key);
    downloadTimerRef.current = setTimeout(() => setJustDownloaded(null), DOWNLOADED_FEEDBACK_MS);
  }, []);

  const handleCopyHex = useCallback(async () => {
    const lines = Object.entries(scheme)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    try {
      await copyToClipboard(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      onNotify?.('Could not copy — please try again.');
    }
  }, [scheme, onNotify]);

  const handleShare = useCallback(async () => {
    const url = buildShareLink();
    if (!url) {
      onNotify?.("Couldn't build a share link right now.");
      return;
    }
    const text = buildShareText(scheme, themeMode);

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Material You Studio palette', text, url });
        onNotify?.('Palette shared');
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return; // user cancelled the share sheet — not an error
        // fall through to clipboard fallback below
      }
    }

    try {
      await copyToClipboard(`${text}\n${url}`);
      onNotify?.('Palette link copied');
    } catch (err) {
      onNotify?.('Could not copy the link — please copy it from the address bar.');
    }
  }, [buildShareLink, onNotify, scheme, themeMode]);

  const handleExportAll = useCallback(async () => {
    setExportingAll(true);
    try {
      exportAllAsZip(scheme, themeMode);
      onNotify?.('Export ready — ZIP downloaded');
    } catch (err) {
      onNotify?.('Could not build the ZIP — please try individual exports.');
    } finally {
      setExportingAll(false);
    }
  }, [scheme, themeMode, onNotify]);

  const formatActions = [
    { key: 'json', label: 'Export JSON', icon: FileJson, onClick: () => exportJSON(scheme, themeMode) },
    { key: 'css', label: 'Export CSS Variables', icon: FileCode2, onClick: () => exportCSSVariables(scheme, themeMode) },
    { key: 'xml', label: 'Export Android XML', icon: Smartphone, onClick: () => exportAndroidXML(scheme, themeMode) },
    { key: 'tailwind', label: 'Export Tailwind Config', icon: Layers, onClick: () => exportTailwindConfig(scheme, themeMode) },
    { key: 'flutter', label: 'Export Flutter Theme', icon: FileText, onClick: () => exportFlutterTheme(scheme, themeMode) },
    { key: 'figma', label: 'Export Figma Tokens', icon: Braces, onClick: () => exportFigmaTokens(scheme, themeMode) }
  ];

  return (
    <section id="export" className="section export-section">
      <div className="container">
        <FadeContent duration={700} blur>
          <span className="section-eyebrow md-label-large">Step 5</span>
          <h2 className="md-headline-large section-heading">Export &amp; share your palette</h2>
          <p className="md-body-large section-subheading">
            Take the {themeMode} scheme anywhere — code, design tools, or mobile platforms — or send a link so
            someone else can open the exact same palette. Every export reflects any colors you've manually edited.
          </p>
        </FadeContent>

        <AnimatedContent distance={50} duration={0.7} ease="power3.out">
          <div className="export-section__hero-row">
            <SpecularButton
              size="md"
              radius={20}
              lineColor={scheme.primary}
              baseColor={scheme.outline}
              intensity={0.7}
              proximity={220}
              className="export-btn export-btn--share"
              onClick={handleShare}
            >
              <span className="export-btn__inner">
                <Share2 size={18} />
                Share Palette
              </span>
            </SpecularButton>

            <MaterialButton icon={copied ? Check : Copy} variant="outlined" onClick={handleCopyHex}>
              {copied ? 'Copied!' : 'Copy HEX'}
            </MaterialButton>

            <MaterialButton
              icon={exportingAll ? PackageCheck : FolderArchive}
              variant="filled"
              onClick={handleExportAll}
              disabled={exportingAll}
            >
              Export All (.zip)
            </MaterialButton>
          </div>

          <div className="export-section__grid">
            {formatActions.map((action) => {
              const isDownloaded = justDownloaded === action.key;
              return (
                <MaterialButton
                  key={action.key}
                  icon={isDownloaded ? Check : action.icon}
                  variant="tonal"
                  onClick={() => {
                    action.onClick();
                    flashDownloaded(action.key);
                  }}
                >
                  {isDownloaded ? 'Downloaded' : action.label}
                </MaterialButton>
              );
            })}
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
