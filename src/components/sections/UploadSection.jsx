import { useCallback, useEffect, useRef, useState } from 'react';
import { UploadCloud, ImagePlus, CheckCircle2, AlertCircle, X } from 'lucide-react';
import SpotlightCard from '../reactbits/SpotlightCard';
import FadeContent from '../reactbits/FadeContent';
import AnimatedContent from '../reactbits/AnimatedContent';
import { createStablePreview } from '../../utils/imageProcessing';
import './UploadSection.css';

export default function UploadSection({ onFileSelected, onClear, sourceImage, status, errorMessage, spotlightColor }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const fileGenerationIdRef = useRef(0);

  // Persistent preview state: { url, fileName, dimensions, loading, failed }
  const [preview, setPreview] = useState(() => {
    if (sourceImage?.previewUrl) {
      return {
        url: sourceImage.previewUrl,
        fileName: sourceImage.fileName || 'Wallpaper',
        dimensions: sourceImage.dimensions || null,
        loading: false,
        failed: false
      };
    }
    return null;
  });

  // Keep track of the active Object URL to safely revoke it only when file changes, is removed, or on unmount
  const activeUrlRef = useRef(null);

  const safelyRevokeUrl = useCallback(() => {
    if (activeUrlRef.current && typeof activeUrlRef.current === 'string' && activeUrlRef.current.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(activeUrlRef.current);
      } catch (e) {
        // ignore
      }
      activeUrlRef.current = null;
    }
  }, []);

  // Revoke only on unmount
  useEffect(() => {
    return () => {
      safelyRevokeUrl();
    };
  }, [safelyRevokeUrl]);

  // Sync dimensions and filename from sourceImage without resetting or changing the stable preview URL
  useEffect(() => {
    if (sourceImage) {
      setPreview((prev) => {
        if (!prev) {
          // If no local preview existed (e.g. hydrated from share link or initial props)
          return {
            url: sourceImage.previewUrl,
            fileName: sourceImage.fileName || 'Wallpaper',
            dimensions: sourceImage.dimensions || null,
            loading: false,
            failed: false
          };
        }
        // Update dimensions and filename while preserving the current, already-loaded preview URL
        const nextUrl = prev.url || (!prev.failed ? null : sourceImage.previewUrl);
        return {
          ...prev,
          url: nextUrl,
          fileName: sourceImage.fileName || prev.fileName,
          dimensions: sourceImage.dimensions || prev.dimensions,
          failed: nextUrl ? false : prev.failed
        };
      });
    } else if (status === 'idle') {
      // Wallpaper was cleared externally (e.g. from Settings modal)
      safelyRevokeUrl();
      setPreview(null);
    }
  }, [sourceImage, status, safelyRevokeUrl]);

  const handleFile = useCallback(
    (file) => {
      setLocalError('');
      if (!file) return;

      const genId = ++fileGenerationIdRef.current;

      // 1. Immediately show loading preview state with the file's name
      setPreview({
        url: null,
        fileName: file.name,
        dimensions: null,
        loading: true,
        failed: false
      });

      // 2. Launch independent preview decoding
      createStablePreview(file)
        .then((result) => {
          if (genId !== fileGenerationIdRef.current) {
            // Superseded by newer upload
            if (result?.url) {
              try {
                URL.revokeObjectURL(result.url);
              } catch (e) {
                // ignore
              }
            }
            return;
          }

          if (result && result.url) {
            // Revoke the previous active URL only when the new one is ready
            safelyRevokeUrl();
            activeUrlRef.current = result.url;
            setPreview({
              url: result.url,
              fileName: file.name,
              dimensions: result.dimensions || null,
              loading: false,
              failed: false
            });
          } else {
            setPreview({
              url: null,
              fileName: file.name,
              dimensions: null,
              loading: false,
              failed: true
            });
          }
        })
        .catch(() => {
          if (genId === fileGenerationIdRef.current) {
            setPreview({
              url: null,
              fileName: file.name,
              dimensions: null,
              loading: false,
              failed: true
            });
          }
        });

      // 3. Launch palette extraction independently
      onFileSelected(file);
    },
    [onFileSelected, safelyRevokeUrl]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const onBrowse = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = '';
  };

  const handleClear = useCallback(() => {
    safelyRevokeUrl();
    setPreview(null);
    onClear();
  }, [onClear, safelyRevokeUrl]);

  const displayError = localError || (status === 'error' ? errorMessage : '');
  const isProcessing = status === 'processing';
  const hasPreview = !!(preview?.url || preview?.loading || preview?.failed);

  return (
    <section id="upload" className="section upload-section">
      <div className="container">
        <FadeContent duration={700} blur>
          <span className="section-eyebrow md-label-large">Step 1</span>
          <h2 className="md-headline-large section-heading">Upload a wallpaper</h2>
          <p className="md-body-large section-subheading">
            Drop in any image and ToneLab will pull a source color straight from it, then build a full
            Material 3 palette around it.
          </p>
        </FadeContent>

        <AnimatedContent distance={60} direction="vertical" duration={0.7} ease="power3.out">
          <SpotlightCard className="upload-card" spotlightColor={spotlightColor}>
            <div
              className={`upload-dropzone ${isDragging ? 'upload-dropzone--active' : ''} ${
                hasPreview ? 'upload-dropzone--has-preview' : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              role="region"
              aria-label="Wallpaper uploader"
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif"
                onChange={onBrowse}
                className="visually-hidden"
                aria-label="Browse for a wallpaper image"
              />

              {hasPreview ? (
                <div className="upload-preview-container">
                  <div className="upload-preview-frame">
                    {preview.failed ? (
                      <div className="upload-preview-fallback">
                        <div className="upload-preview-fallback-icon">
                          <ImagePlus size={32} strokeWidth={1.5} />
                        </div>
                        <p className="md-title-small upload-preview-fallback-title">
                          {preview.fileName}
                        </p>
                        <p className="md-body-small upload-preview-fallback-desc">
                          Wallpaper active • Preview rendering unavailable for this specific image encoding
                        </p>
                      </div>
                    ) : preview.url ? (
                      <img
                        src={preview.url}
                        alt={preview.fileName ? `Uploaded wallpaper: ${preview.fileName}` : 'Uploaded wallpaper preview'}
                        className="upload-preview-img upload-preview-img--ready"
                        onError={() => {
                          setPreview((p) => (p ? { ...p, failed: true } : p));
                        }}
                      />
                    ) : null}

                    {(preview.loading || isProcessing) && (
                      <div className="upload-preview-overlay" aria-live="polite">
                        <div className="upload-preview-spinner" />
                        <span className="upload-preview-loading-text md-label-medium">
                          {preview.loading
                            ? 'Loading wallpaper preview…'
                            : 'Extracting Material You palette…'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="upload-preview-meta">
                    <div className="upload-preview-info">
                      <span className="upload-preview-filename md-title-small" title={preview.fileName}>
                        {preview.fileName}
                      </span>
                      {preview.dimensions?.width && preview.dimensions?.height && (
                        <span className="upload-preview-dimensions md-body-small">
                          {preview.dimensions.width} × {preview.dimensions.height} px
                        </span>
                      )}
                    </div>

                    <span className="upload-preview-tag md-label-small">
                      {isProcessing ? 'Processing…' : 'Active wallpaper'}
                    </span>
                  </div>

                  <div className="upload-actions">
                    <button
                      type="button"
                      className="upload-browse-btn md-label-large"
                      onClick={(e) => {
                        e.stopPropagation();
                        inputRef.current?.click();
                      }}
                    >
                      <ImagePlus size={18} />
                      <span>Choose a different image</span>
                    </button>

                    <button
                      type="button"
                      className="upload-clear-btn md-label-large"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                      aria-label="Remove uploaded wallpaper"
                    >
                      <X size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="upload-placeholder"
                  onClick={() => inputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
                >
                  <UploadCloud size={38} strokeWidth={1.5} />
                  <p className="md-title-medium upload-placeholder__heading-desktop">Drag &amp; drop your wallpaper here</p>
                  <p className="md-title-medium upload-placeholder__heading-mobile">Upload your wallpaper</p>
                  <p className="md-body-medium upload-placeholder__subtext">Supports all common image formats • Any size or aspect ratio</p>

                  <div className="upload-actions">
                    <button
                      type="button"
                      className="upload-browse-btn md-label-large"
                      onClick={(e) => {
                        e.stopPropagation();
                        inputRef.current?.click();
                      }}
                    >
                      <ImagePlus size={18} />
                      <span>Choose image</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {status === 'ready' && (sourceImage || preview?.url || preview?.dimensions) && (
              <p className="upload-status upload-status--ok md-body-medium">
                <CheckCircle2 size={16} />
                Palette generated from {preview?.fileName || sourceImage?.fileName}
                {preview?.dimensions?.width && preview?.dimensions?.height
                  ? ` • ${preview.dimensions.width} × ${preview.dimensions.height}`
                  : sourceImage?.dimensions?.width && sourceImage?.dimensions?.height
                  ? ` • ${sourceImage.dimensions.width} × ${sourceImage.dimensions.height}`
                  : ''}
              </p>
            )}

            {displayError && (
              <p className="upload-status upload-status--error md-body-medium">
                <AlertCircle size={16} /> {displayError}
              </p>
            )}
          </SpotlightCard>
        </AnimatedContent>
      </div>
    </section>
  );
}
