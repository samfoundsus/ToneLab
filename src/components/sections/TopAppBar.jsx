import { Palette } from 'lucide-react';
import { useScrolledPast } from '../../hooks/useScrolledPast';
import './TopAppBar.css';

export default function TopAppBar({ onNavigate }) {
  const scrolled = useScrolledPast(24);

  return (
    <header className={`top-app-bar ${scrolled ? 'top-app-bar--scrolled' : ''}`}>
      <div className="top-app-bar__inner">
        <button className="top-app-bar__brand" onClick={() => onNavigate('hero')} aria-label="Material You Studio, go to top">
          <span className="top-app-bar__mark">
            <Palette size={18} strokeWidth={2.4} />
          </span>
          <span className="md-title-large top-app-bar__title">Material You Studio</span>
        </button>

        <nav className="top-app-bar__nav" aria-label="Section navigation">
          <button className="md-label-large" onClick={() => onNavigate('upload')}>Upload</button>
          <button className="md-label-large" onClick={() => onNavigate('preview')}>Preview</button>
          <button className="md-label-large" onClick={() => onNavigate('themes')}>Themes</button>
          <button className="md-label-large" onClick={() => onNavigate('roles')}>Colors</button>
          <button className="md-label-large" onClick={() => onNavigate('export')}>Export</button>
        </nav>
      </div>
    </header>
  );
}
