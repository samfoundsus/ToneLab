import { useCallback, useRef, useState } from 'react';
import {
  FileJson,
  FileCode2,
  FileText,
  Braces,
  Smartphone,
  Layers,
  Copy,
  Check,
  Share2,
  PackageCheck,
  FolderArchive
} from 'lucide-react';
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
  const [justDownloaded, setJustDownloaded] = useState(null);
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
      onNotify?.('All HEX values copied');
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      onNotify?.('Could not copy HEX values');
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
        await navigator.share({ title: 'ToneLab palette', text, url });
        onNotify?.('Palette shared');
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }

    try {
      await copyToClipboard(`${text}\n${url}`);
      onNotify?.('Palette share link copied');
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
    {
      key: 'json',
      label: 'Export JSON',
      shortLabel: 'JSON',
      icon: FileJson,
      onClick: () => {
        exportJSON(scheme, themeMode);
        onNotify?.('JSON palette exported');
      }
    },
    {
      key: 'css',
      label: 'Export CSS Variables',
      shortLabel: 'CSS',
      icon: FileCode2,
      onClick: () => {
        exportCSSVariables(scheme, themeMode);
        onNotify?.('CSS variables exported');
      }
    },
    {
      key: 'xml',
      label: 'Export Android XML',
      shortLabel: 'Android XML',
      icon: Smartphone,
      onClick: () => {
        exportAndroidXML(scheme, themeMode);
        onNotify?.('Android XML exported');
      }
    },
    {
      key: 'tailwind',
      label: 'Export Tailwind Config',
      shortLabel: 'Tailwind',
      icon: Layers,
      onClick: () => {
        exportTailwindConfig(scheme, themeMode);
        onNotify?.('Tailwind config exported');
      }
    },
    {
      key: 'flutter',
      label: 'Export Flutter Theme',
      shortLabel: 'Flutter',
      icon: FileText,
      onClick: () => {
        exportFlutterTheme(scheme, themeMode);
        onNotify?.('Flutter theme exported');
      }
    },
    {
      key: 'figma',
      label: 'Export Figma Tokens',
      shortLabel: 'Figma',
      icon: Braces,
      onClick: () => {
        exportFigmaTokens(scheme, themeMode);
        onNotify?.('Figma tokens exported');
      }
    }
  ];

  return (
    <section id="export" className="section export-section">
      <div className="container">
        <FadeContent duration={700} blur>
          <span className="section-eyebrow md-label-large">Step 4</span>
          <h2 className="md-headline-large section-heading">Export &amp; share your palette</h2>
          <p className="md-body-large section-subheading">
            Take the {themeMode} scheme anywhere — code, design tools, or mobile platforms — or send a link so
            someone else can open the exact same palette. Every export reflects your current palette and any manual edits.
          </p>
        </FadeContent>

        <AnimatedContent distance={50} duration={0.7} ease="power3.out">
          {/* Primary Action Row */}
          <div className="export-section__primary-group">
            <MaterialButton
              icon={exportingAll ? PackageCheck : FolderArchive}
              variant="filled"
              className="export-btn--primary-zip"
              onClick={handleExportAll}
              disabled={exportingAll}
            >
              Export All (.zip)
            </MaterialButton>

            <div className="export-section__secondary-row">
              <MaterialButton
                icon={Share2}
                variant="tonal"
                className="export-btn--share"
                onClick={handleShare}
              >
                Share Palette
              </MaterialButton>

              <MaterialButton
                icon={copied ? Check : Copy}
                variant="outlined"
                className="export-btn--copy-hex"
                onClick={handleCopyHex}
              >
                {copied ? 'Copied' : 'Copy HEX'}
              </MaterialButton>
            </div>
          </div>

          {/* Formats Grid */}
          <div className="export-section__grid">
            {formatActions.map((action) => {
              const isDownloaded = justDownloaded === action.key;
              return (
                <MaterialButton
                  key={action.key}
                  icon={isDownloaded ? Check : action.icon}
                  variant="tonal"
                  className="export-format-btn"
                  onClick={() => {
                    action.onClick();
                    flashDownloaded(action.key);
                  }}
                >
                  <span className="export-btn__label-full">
                    {isDownloaded ? 'Downloaded' : action.label}
                  </span>
                  <span className="export-btn__label-short">
                    {isDownloaded ? 'Done' : action.shortLabel}
                  </span>
                </MaterialButton>
              );
            })}
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
