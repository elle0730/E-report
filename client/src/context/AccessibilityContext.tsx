import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, t } from '../utils/translations.js';

interface AccessibilityContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  textScale: number; // 1.0 to 2.0
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
  resetTextSize: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  listen: (onResult: (text: string) => void) => void;
  stopListening: () => void;
  isListening: boolean;
  speechSupported: boolean;
  tutorialOpen: boolean;
  openTutorial: () => void;
  closeTutorial: () => void;
  t: (key: string) => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load preferences from localStorage
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('bensican_lang') as Language) || 'en';
  });

  const [textScale, setTextScale] = useState<number>(() => {
    const saved = localStorage.getItem('bensican_text_scale');
    return saved ? parseFloat(saved) : 1.0;
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('bensican_contrast') === 'high';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('bensican_theme') as 'light' | 'dark') || 'light';
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const [tutorialOpen, setTutorialOpen] = useState<boolean>(() => {
    return localStorage.getItem('bensican_tutorial_seen') !== 'true';
  });

  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bensican_lang', lang);
  };

  const increaseTextSize = () => {
    setTextScale(prev => {
      const next = Math.min(2.0, parseFloat((prev + 0.15).toFixed(2)));
      localStorage.setItem('bensican_text_scale', next.toString());
      return next;
    });
  };

  const decreaseTextSize = () => {
    setTextScale(prev => {
      const next = Math.max(0.9, parseFloat((prev - 0.15).toFixed(2)));
      localStorage.setItem('bensican_text_scale', next.toString());
      return next;
    });
  };

  const resetTextSize = () => {
    setTextScale(1.0);
    localStorage.setItem('bensican_text_scale', '1.0');
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => {
      const next = !prev;
      localStorage.setItem('bensican_contrast', next ? 'high' : 'normal');
      return next;
    });
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('bensican_theme', next);
      return next;
    });
  };

  const openTutorial = () => setTutorialOpen(true);
  const closeTutorial = () => {
    setTutorialOpen(false);
    localStorage.setItem('bensican_tutorial_seen', 'true');
  };

  // Text-to-Speech
  const speak = (text: string) => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Adjust speech rate slightly slower for elderly comprehension
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Pick appropriate voice language tag
    if (language === 'tl') {
      utterance.lang = 'fil-PH';
    } else if (language === 'il') {
      utterance.lang = 'fil-PH'; // fallback to Filipino voice phonetics for Ilocano
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Speech-to-Text (Voice input)
  const listen = (onResult: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is not supported by your current browser. You can still type directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'en' ? 'en-US' : 'fil-PH';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognitionInstance(recognition);
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionInstance) {
      recognitionInstance.stop();
      setIsListening(false);
    }
  };

  // Apply dark class and contrast class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }

    // Set root font size scale
    root.style.fontSize = `${18 * textScale}px`;
  }, [theme, highContrast, textScale]);

  const translateHelper = (key: string) => t(key, language);

  return (
    <AccessibilityContext.Provider
      value={{
        language,
        setLanguage,
        textScale,
        increaseTextSize,
        decreaseTextSize,
        resetTextSize,
        highContrast,
        toggleHighContrast,
        theme,
        toggleTheme,
        speak,
        stopSpeaking,
        isSpeaking,
        listen,
        stopListening,
        isListening,
        speechSupported,
        tutorialOpen,
        openTutorial,
        closeTutorial,
        t: translateHelper
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

