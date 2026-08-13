import { memo } from 'react';
import './MaterialButton.css';

/**
 * A plain CSS Material 3 button (filled / tonal / outlined). Introduced in
 * V2 to replace most of the WebGL `SpecularButton` instances in the Export
 * section — seven concurrently-mounted WebGL contexts each running their
 * own requestAnimationFrame loop and a `window` pointermove listener was a
 * real, measurable cost with no real visual payoff for a plain list of
 * download buttons. `SpecularButton` is kept for the one or two moments
 * that actually deserve the extra shine (Hero CTA, Share Palette).
 */
function MaterialButton({ icon: Icon, children, onClick, variant = 'tonal', className = '', type = 'button', ...rest }) {
  return (
    <button
      type={type}
      className={`material-btn material-btn--${variant} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {Icon && <Icon size={18} className="material-btn__icon" />}
      <span>{children}</span>
    </button>
  );
}

export default memo(MaterialButton);
