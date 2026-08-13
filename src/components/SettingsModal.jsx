import { X, Info, RotateCcw } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import './SettingsModal.css';

export default function SettingsModal({ open, onClose, onResetWallpaper, sourceImage }) {
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <div className="settings-modal__scrim" onClick={onClose}>
      <div
        className="settings-modal glass-surface"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-modal__header">
          <p className="md-title-large">Settings</p>
          <button className="settings-modal__close" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <div className="settings-modal__body">
          <div className="settings-modal__row">
            <div>
              <p className="md-title-medium">Current wallpaper</p>
              <p className="md-body-medium">{sourceImage ? sourceImage.fileName : 'Using the default seed color'}</p>
            </div>
            <button className="settings-modal__action" onClick={onResetWallpaper}>
              <RotateCcw size={16} /> Remove
            </button>
          </div>

          <div className="settings-modal__row">
            <div>
              <p className="md-title-medium">About</p>
              <p className="md-body-medium">
                Material You Studio generates Material Design 3 palettes entirely on-device. No images or colors are
                ever uploaded to a server.
              </p>
            </div>
            <Info size={20} className="settings-modal__info-icon" />
          </div>
        </div>
      </div>
    </div>
  );
}
