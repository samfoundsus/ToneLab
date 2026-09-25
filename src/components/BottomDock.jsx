import { Home, Wand2, Palette, Download, Settings } from 'lucide-react';
import Dock from './reactbits/Dock';

export default function BottomDock({ onNavigate, onSettings, activeSection = 'hero' }) {
  const items = [
    {
      icon: <Home size={20} />,
      label: 'Home',
      onClick: () => onNavigate('hero'),
      className: activeSection === 'hero' ? 'dock-item--active' : ''
    },
    {
      icon: <Wand2 size={20} />,
      label: 'Generate',
      onClick: () => onNavigate('upload'),
      className: activeSection === 'upload' ? 'dock-item--active' : ''
    },
    {
      icon: <Palette size={20} />,
      label: 'Themes',
      onClick: () => onNavigate('themes'),
      className: activeSection === 'themes' || activeSection === 'preview' ? 'dock-item--active' : ''
    },
    {
      icon: <Download size={20} />,
      label: 'Export',
      onClick: () => onNavigate('export'),
      className: activeSection === 'export' || activeSection === 'roles' ? 'dock-item--active' : ''
    },
    {
      icon: <Settings size={20} />,
      label: 'Settings',
      onClick: onSettings
    }
  ];

  return <Dock items={items} panelHeight={64} baseItemSize={46} magnification={58} distance={120} />;
}
