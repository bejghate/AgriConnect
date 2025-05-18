import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAccessibility, AccessibilityPreferences, FontSizeType } from '@/hooks/useAccessibility';

// Interface pour le contexte d'accessibilité
interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  loading: boolean;
  setFontSize: (size: FontSizeType) => Promise<void>;
  setHighContrast: (enabled: boolean) => Promise<void>;
  setReduceMotion: (enabled: boolean) => Promise<void>;
  setHapticFeedback: (enabled: boolean) => Promise<void>;
  setScreenReaderEnabled: (enabled: boolean) => Promise<void>;
  setVoiceCommands: (enabled: boolean) => Promise<void>;
  setTextToSpeech: (enabled: boolean) => Promise<void>;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
  resetPreferences: () => Promise<void>;
}

// Création du contexte avec des valeurs par défaut
const AccessibilityContext = createContext<AccessibilityContextType>({
  preferences: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    hapticFeedback: true,
    screenReaderEnabled: false,
    voiceCommands: false,
    textToSpeech: false,
  },
  loading: true,
  setFontSize: async () => {},
  setHighContrast: async () => {},
  setReduceMotion: async () => {},
  setHapticFeedback: async () => {},
  setScreenReaderEnabled: async () => {},
  setVoiceCommands: async () => {},
  setTextToSpeech: async () => {},
  triggerHaptic: () => {},
  resetPreferences: async () => {},
});

// Hook personnalisé pour utiliser le contexte d'accessibilité
export const useAccessibilityContext = () => useContext(AccessibilityContext);

// Propriétés du fournisseur d'accessibilité
interface AccessibilityProviderProps {
  children: ReactNode;
}

// Fournisseur d'accessibilité
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  // Utiliser le hook d'accessibilité
  const {
    preferences,
    loading,
    setFontSize,
    setHighContrast,
    setReduceMotion,
    setHapticFeedback,
    setScreenReaderEnabled,
    setVoiceCommands,
    setTextToSpeech,
    triggerHaptic,
    resetPreferences,
  } = useAccessibility();

  // Appliquer les styles CSS pour le mode contraste élevé sur le web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        if (preferences.highContrast) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }
      } catch (error) {
        console.error('Erreur lors de l\'application du mode contraste élevé:', error);
      }
    }
  }, [preferences.highContrast]);

  // Appliquer les styles CSS pour la réduction des animations sur le web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        if (preferences.reduceMotion) {
          document.documentElement.classList.add('reduce-motion');
        } else {
          document.documentElement.classList.remove('reduce-motion');
        }
      } catch (error) {
        console.error('Erreur lors de l\'application de la réduction des animations:', error);
      }
    }
  }, [preferences.reduceMotion]);

  // Appliquer les styles CSS pour la taille de police sur le web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        document.documentElement.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
        document.documentElement.classList.add(`font-${preferences.fontSize}`);
      } catch (error) {
        console.error('Erreur lors de l\'application de la taille de police:', error);
      }
    }
  }, [preferences.fontSize]);

  // Valeur du contexte
  const contextValue: AccessibilityContextType = {
    preferences,
    loading,
    setFontSize,
    setHighContrast,
    setReduceMotion,
    setHapticFeedback,
    setScreenReaderEnabled,
    setVoiceCommands,
    setTextToSpeech,
    triggerHaptic,
    resetPreferences,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityContext;
