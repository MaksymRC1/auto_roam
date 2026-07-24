import { useEffect } from 'react';

export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    // Get current scroll position
    const scrollY = window.scrollY;
    
    // Save original styles
    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    // Apply basic lock
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // For mobile devices, apply fixed position to prevent body scroll completely
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    }

    return () => {
      // Restore styles
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      
      if (isMobile) {
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        // Restore scroll position without smooth scrolling
        window.scrollTo({
          top: scrollY,
          behavior: 'auto'
        });
      }
    };
  }, [isOpen]);
}
