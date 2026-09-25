import { Palette, Github } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container app-footer__inner">
        <div className="app-footer__brand">
          <span className="app-footer__mark">
            <Palette size={16} />
          </span>
          <span className="md-title-medium">ToneLab</span>
        </div>

        <p className="md-body-medium app-footer__note">
          Built with React, Vite and Material Design 3 Expressive. Palettes are generated entirely in your browser —
          nothing you upload ever leaves your device.
        </p>

        <a
          className="app-footer__link md-label-large"
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
        >
          <Github size={16} /> Source
        </a>
      </div>
    </footer>
  );
}
