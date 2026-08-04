import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FontSizeContextType {
  fontSizePercent: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  setFontSizePercent: (percent: number) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export interface FontSizeProviderProps {
  children: ReactNode;
}

export const FontSizeProvider: React.FC<FontSizeProviderProps> = ({ children }) => {
  const [fontSizePercent, setFontSizePercentState] = useState<number>(() => {
    const saved = localStorage.getItem('2click_font_size');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 85 && parsed <= 125) {
        return parsed;
      }
    }
    return 100;
  });

  useEffect(() => {
    document.documentElement.style.transition = 'font-size 0.2s ease-out';
    document.documentElement.style.fontSize = `${fontSizePercent}%`;
    localStorage.setItem('2click_font_size', fontSizePercent.toString());

    // Dispatch resize event so responsive components (charts, maps, canvases) auto-adjust layout
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 220);

    return () => clearTimeout(timer);
  }, [fontSizePercent]);

  const increaseFontSize = () => {
    setFontSizePercentState((prev) => Math.min(prev + 5, 125));
  };

  const decreaseFontSize = () => {
    setFontSizePercentState((prev) => Math.max(prev - 5, 85));
  };

  const resetFontSize = () => {
    setFontSizePercentState(100);
  };

  const setFontSizePercent = (percent: number) => {
    const clamped = Math.max(85, Math.min(125, percent));
    setFontSizePercentState(clamped);
  };

  return (
    <FontSizeContext.Provider
      value={{
        fontSizePercent,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        setFontSizePercent
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = (): FontSizeContextType => {
  const context = useContext(FontSizeContext);
  if (!context) {
    return {
      fontSizePercent: 100,
      increaseFontSize: () => {},
      decreaseFontSize: () => {},
      resetFontSize: () => {},
      setFontSizePercent: () => {}
    };
  }
  return context;
};
