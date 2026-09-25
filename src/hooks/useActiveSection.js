import { useEffect, useState } from 'react';

/**
 * Tracks which page section is currently in view using IntersectionObserver
 * with fallback to scroll position measurement.
 */
export function useActiveSection(sectionIds = ['hero', 'upload', 'preview', 'themes', 'roles', 'export']) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] || 'hero');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -40% 0px',
        threshold: [0, 0.25, 0.5]
      };

      const visibleEntries = new Map();

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          visibleEntries.set(entry.target.id, entry);
        });

        // Determine the most visible section
        let topSection = null;
        let maxRatio = 0;

        for (const id of sectionIds) {
          const entry = visibleEntries.get(id);
          if (entry && entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            topSection = id;
          }
        }

        if (topSection) {
          setActiveSection(topSection);
        } else {
          // Fallback based on scroll position if at the very top or bottom
          if (window.scrollY < 120) {
            setActiveSection('hero');
          } else if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
            setActiveSection(sectionIds[sectionIds.length - 1]);
          }
        }
      }, observerOptions);

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });

      return () => observer.disconnect();
    }

    // Scroll listener fallback for older environments
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds]);

  return activeSection;
}
