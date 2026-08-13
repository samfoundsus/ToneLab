import { Home, Wand2, Palette, Download, Settings } from 'lucide-react';
import Dock from './reactbits/Dock';

export default function BottomDock({ onNavigate, onSettings }) {
  const items = [
    { icon: <Home size={20} />, label: 'Home', onClick: () => onNavigate('hero') },
    { icon: <Wand2 size={20} />, label: 'Generate', onClick: () => onNavigate('upload') },
    { icon: <Palette size={20} />, label: 'Themes', onClick: () => onNavigate('themes') },
    { icon: <Download size={20} />, label: 'Export', onClick: () => onNavigate('export') },
    { icon: <Settings size={20} />, label: 'Settings', onClick: onSettings }
  ];

  return <Dock items={items} panelHeight={64} baseItemSize={48} magnification={64} distance={140} />;
}
