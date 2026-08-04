import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FullscreenData {
  title: string;
  subtitle?: string;
  content?: ReactNode;
  htmlContent?: string;
  badge?: string;
}

export interface FullscreenContextType {
  isFullscreenOpen: boolean;
  fullscreenData: FullscreenData | null;
  openFullscreen: (data: FullscreenData) => void;
  closeFullscreen: () => void;
  toggleFullscreen: (data: FullscreenData) => void;
}

const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

export interface FullscreenProviderProps {
  children: ReactNode;
}

export const FullscreenProvider: React.FC<FullscreenProviderProps> = ({ children }) => {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);
  const [fullscreenData, setFullscreenData] = useState<FullscreenData | null>(null);

  const openFullscreen = (data: FullscreenData) => {
    setFullscreenData(data);
    setIsFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreenOpen(false);
  };

  const toggleFullscreen = (data: FullscreenData) => {
    if (isFullscreenOpen) {
      closeFullscreen();
    } else {
      openFullscreen(data);
    }
  };

  // Keyboard shortcut (ESC key listener)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenOpen) {
        closeFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen]);

  // Universal double-click capture on page elements
  useEffect(() => {
    const handleGlobalDblClick = (e: MouseEvent) => {
      // If modal is already open, any double-click inside/on modal exits fullscreen
      if (isFullscreenOpen) {
        closeFullscreen();
        return;
      }

      // Check if user double-clicked an element with data-fullscreen or a card container
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Do not trigger if double-clicked inside input, button, select, or textarea
      const tag = target.tagName.toLowerCase();
      if (['input', 'button', 'select', 'textarea', 'a', 'option'].includes(tag)) {
        return;
      }

      // Find closest card, preview container, canvas, or block
      const cardElement = target.closest(
        '[data-fullscreen-title], [data-fullscreen="true"], .fullscreen-card, .bg-white, .bg-slate-800, .bg-slate-900, .rounded-2xl, .rounded-3xl, .border'
      ) as HTMLElement | null;

      if (cardElement) {
        // Extract title from attribute or heading inside element
        const customTitle = cardElement.getAttribute('data-fullscreen-title');
        const customSubtitle = cardElement.getAttribute('data-fullscreen-subtitle');
        const headingEl = cardElement.querySelector('h1, h2, h3, h4, .font-bold, .font-black');
        
        const extractedTitle = customTitle || headingEl?.textContent?.trim() || 'High-Resolution Section View';
        const htmlToRender = cardElement.outerHTML;

        // Open in full-screen view
        openFullscreen({
          title: extractedTitle,
          subtitle: customSubtitle || 'Double-clicked section expanded in 100% viewport mode',
          htmlContent: htmlToRender,
          badge: 'Double-Click Fullscreen'
        });
      }
    };

    window.addEventListener('dblclick', handleGlobalDblClick);
    return () => window.removeEventListener('dblclick', handleGlobalDblClick);
  }, [isFullscreenOpen]);

  return (
    <FullscreenContext.Provider
      value={{
        isFullscreenOpen,
        fullscreenData,
        openFullscreen,
        closeFullscreen,
        toggleFullscreen
      }}
    >
      {children}
    </FullscreenContext.Provider>
  );
};

export const useFullscreen = (): FullscreenContextType => {
  const context = useContext(FullscreenContext);
  if (!context) {
    return {
      isFullscreenOpen: false,
      fullscreenData: null,
      openFullscreen: () => {},
      closeFullscreen: () => {},
      toggleFullscreen: () => {}
    };
  }
  return context;
};
