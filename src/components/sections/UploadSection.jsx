import { useCallback, useRef, useState } from 'react';
import { UploadCloud, ImagePlus, CheckCircle2, AlertCircle, X } from 'lucide-react';
import SpotlightCard from '../reactbits/SpotlightCard';
import FadeContent from '../reactbits/FadeContent';
import AnimatedContent from '../reactbits/AnimatedContent';
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_EXT_LABEL, isSupportedImageFile } from '../../utils/imageProcessing';
import './UploadSection.css';

export default function UploadSection({ onFileSelected, onClear, sourceImage, status, errorMessage, spotlightColor }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleFile = useCallback((file) => {
    setLocalError('');
    if (!file) return;
    if (!isSupportedImageFile(file)) {
      setLocalError(`Unsupported format. Please use ${ACCEPTED_EXT_LABEL}.`);
      return;
    }
    onFileSelected(file);
  }, [onFileSelected]);

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

  const displayError = localError || (status === 'error' ? errorMessage : '');

  return (
    <section id="upload" className="section upload-section">
      <div className="container">
        <FadeContent duration={700} blur>
          <span className="section-eyebrow md-label-large">Step 1</span>
          <h2 className="md-headline-large section-heading">Upload a wallpaper</h2>
          <p className="md-body-large section-subheading">
            Drop in any image and Material You Studio will pull a source color straight from it, then build a full
            Material 3 palette around it.
          </p>
        </FadeContent>

        <AnimatedContent distance={60} direction="vertical" duration={0.7} ease="power3.out">
          <SpotlightCard className="upload-card" spotlightColor={spotlightColor}>
            <div
              className={`upload-dropzone ${isDragging ? 'upload-dropzone--active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={onBrowse}
                className="visually-hidden"
                aria-label="Browse for a wallpaper image"
              />

              {sourceImage ? (
                <img src={sourceImage.previewUrl} alt="Uploaded wallpaper preview" className="upload-preview" />
              ) : (
                <div className="upload-placeholder">
                  <UploadCloud size={40} strokeWidth={1.5} />
                  <p className="md-title-medium">Drag &amp; drop your wallpaper here</p>
                  <p className="md-body-medium">Supports {ACCEPTED_EXT_LABEL}</p>
                </div>
              )}

              <div className="upload-actions">
                <button
                  type="button"
                  className="upload-browse-btn md-label-large"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                  <ImagePlus size={18} />
                  {sourceImage ? 'Choose a different image' : 'Browse files'}
                </button>

                {sourceImage && (
                  <button
                    type="button"
                    className="upload-clear-btn md-label-large"
                    onClick={(e) => { e.stopPropagation(); onClear(); }}
                    aria-label="Remove uploaded wallpaper"
                  >
                    <X size={16} />
                    Remove
                  </button>
                )}
              </div>
            </div>

            {status === 'processing' && (
              <div className="upload-progress upload-progress--indeterminate" role="progressbar" aria-label="Processing wallpaper">
                <div className="upload-progress__bar" />
              </div>
            )}

            {status === 'ready' && sourceImage && (
              <p className="upload-status upload-status--ok md-body-medium">
                <CheckCircle2 size={16} />
                Palette generated from {sourceImage.fileName}
                {sourceImage.downscaled ? ' (optimized for processing)' : ''}
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
