import { useState, useEffect, useRef } from 'react';
import { Palette, Menu, X, UploadCloud, Eye, Sparkles, Paintbrush, Download } from 'lucide-react';
import { useScrolledPast } from '../../hooks/useScrolledPast';
import './TopAppBar.css';

const NAV_ITEMS = [
  { id: 'upload', label: 'Upload', icon: UploadCloud },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'themes', label: 'Themes', icon: Sparkles },
  { id: 'roles', label: 'Colors', icon: Paintbrush },
  { id: 'export', label: 'Export', icon: Download }
];

export default function TopAppBar({ onNavigate, activeSection = 'hero' }) {
  const scrolled = useScrolledPast(24);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleBtnRef = useRef(null);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handlePointerDown = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header className={`top-app-bar ${scrolled ? 'top-app-bar--scrolled' : ''} ${mobileMenuOpen ? 'top-app-bar--menu-open' : ''}`}>
      <div className="top-app-bar__inner">
        <button
          className="top-app-bar__brand"
          onClick={() => {
            setMobileMenuOpen(false);
            onNavigate('hero');
          }}
          aria-label="ToneLab, go to top"
        >
          <span className="top-app-bar__mark">
            <Palette size={18} strokeWidth={2.4} />
          </span>
          <span className="md-title-large top-app-bar__title">ToneLab</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="top-app-bar__nav" aria-label="Section navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                className={`top-app-bar__nav-btn md-label-large ${isActive ? 'top-app-bar__nav-btn--active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button
          ref={toggleBtnRef}
          type="button"
          className="top-app-bar__mobile-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="mobile-nav-sheet"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown Sheet */}
      {mobileMenuOpen && (
        <div id="mobile-nav-sheet" ref={menuRef} className="top-app-bar__mobile-sheet" role="dialog" aria-label="Mobile navigation">
          <nav className="top-app-bar__mobile-nav">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  className={`top-app-bar__mobile-nav-item ${isActive ? 'top-app-bar__mobile-nav-item--active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="top-app-bar__mobile-nav-icon">
                    <Icon size={18} />
                  </span>
                  <span className="top-app-bar__mobile-nav-label">{item.label}</span>
                  {isActive && <span className="top-app-bar__mobile-active-dot" aria-hidden="true" />}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
