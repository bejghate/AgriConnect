import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useColorScheme, Platform } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

// Clés de stockage pour les préférences d'accessibilité
const STORAGE_KEYS = {
  FONT_SIZE: 'accessibility_font_size',
  HIGH_CONTRAST: 'accessibility_high_contrast',
  REDUCE_MOTION: 'accessibility_reduce_motion',
  HAPTIC_FEEDBACK: 'accessibility_haptic_feedback',
  SCREEN_READER_ENABLED: 'accessibility_screen_reader',
  VOICE_COMMANDS: 'accessibility_voice_commands',
  TEXT_TO_SPEECH: 'accessibility_text_to_speech',
};

// Types de taille de police
export type FontSizeType = 'small' | 'medium' | 'large' | 'extra-large';

// Interface pour les préférences d'accessibilité
export interface AccessibilityPreferences {
  fontSize: FontSizeType;
  highContrast: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  screenReaderEnabled: boolean;
  voiceCommands: boolean;
  textToSpeech: boolean;
}

// Valeurs par défaut
const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  fontSize: 'medium',
  highContrast: false,
  reduceMotion: false,
  hapticFeedback: true,
  screenReaderEnabled: false,
  voiceCommands: false,
  textToSpeech: false,
};

/**
 * Hook personnalisé pour gérer les préférences d'accessibilité
 */
export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const { setThemeType } = useAppStore();

  // Charger les préférences depuis le stockage
  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);

      // Récupérer les préférences stockées
      const storedFontSize = await AsyncStorage.getItem(STORAGE_KEYS.FONT_SIZE);
      const storedHighContrast = await AsyncStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST);
      const storedReduceMotion = await AsyncStorage.getItem(STORAGE_KEYS.REDUCE_MOTION);
      const storedHapticFeedback = await AsyncStorage.getItem(STORAGE_KEYS.HAPTIC_FEEDBACK);
      const storedScreenReader = await AsyncStorage.getItem(STORAGE_KEYS.SCREEN_READER_ENABLED);
      const storedVoiceCommands = await AsyncStorage.getItem(STORAGE_KEYS.VOICE_COMMANDS);
      const storedTextToSpeech = await AsyncStorage.getItem(STORAGE_KEYS.TEXT_TO_SPEECH);

      // Mettre à jour les préférences avec les valeurs stockées
      setPreferences({
        fontSize: (storedFontSize as FontSizeType) || DEFAULT_PREFERENCES.fontSize,
        highContrast: storedHighContrast === 'true' || DEFAULT_PREFERENCES.highContrast,
        reduceMotion: storedReduceMotion === 'true' || DEFAULT_PREFERENCES.reduceMotion,
        hapticFeedback: storedHapticFeedback !== 'false', // Par défaut à true sauf si explicitement false
        screenReaderEnabled: storedScreenReader === 'true' || DEFAULT_PREFERENCES.screenReaderEnabled,
        voiceCommands: storedVoiceCommands === 'true' || DEFAULT_PREFERENCES.voiceCommands,
        textToSpeech: storedTextToSpeech === 'true' || DEFAULT_PREFERENCES.textToSpeech,
      });

      // Appliquer le thème à contraste élevé si nécessaire
      if (storedHighContrast === 'true') {
        setThemeType('high-contrast');
      } else {
        setThemeType(colorScheme === 'dark' ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences d\'accessibilité:', error);
    } finally {
      setLoading(false);
    }
  }, [colorScheme, setThemeType]);

  // Sauvegarder une préférence
  const savePreference = useCallback(async (key: string, value: string | boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de la préférence ${key}:`, error);
    }
  }, []);

  // Mettre à jour la taille de police
  const setFontSize = useCallback(async (size: FontSizeType) => {
    setPreferences(prev => ({ ...prev, fontSize: size }));
    await savePreference(STORAGE_KEYS.FONT_SIZE, size);
  }, [savePreference]);

  // Mettre à jour le mode contraste élevé
  const setHighContrast = useCallback(async (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, highContrast: enabled }));
    await savePreference(STORAGE_KEYS.HIGH_CONTRAST, enabled);

    // Mettre à jour le thème
    setThemeType(enabled ? 'high-contrast' : (colorScheme === 'dark' ? 'dark' : 'light'));
  }, [savePreference, colorScheme, setThemeType]);

  // Mettre à jour la réduction des animations
  const setReduceMotion = useCallback(async (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, reduceMotion: enabled }));
    await savePreference(STORAGE_KEYS.REDUCE_MOTION, enabled);
  }, [savePreference]);

  // Mettre à jour le retour haptique
  const setHapticFeedback = useCallback(async (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, hapticFeedback: enabled }));
    await savePreference(STORAGE_KEYS.HAPTIC_FEEDBACK, enabled);
  }, [savePreference]);

  // Mettre à jour le mode lecteur d'écran
  const setScreenReaderEnabled = useCallback(async (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, screenReaderEnabled: enabled }));
    await savePreference(STORAGE_KEYS.SCREEN_READER_ENABLED, enabled);
  }, [savePreference]);

  // Mettre à jour les commandes vocales
  const setVoiceCommands = useCallback(async (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, voiceCommands: enabled }));
    await savePreference(STORAGE_KEYS.VOICE_COMMANDS, enabled);
  }, [savePreference]);

  // Mettre à jour la synthèse vocale
  const setTextToSpeech = useCallback(async (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, textToSpeech: enabled }));
    await savePreference(STORAGE_KEYS.TEXT_TO_SPEECH, enabled);
  }, [savePreference]);

  // Déclencher un retour haptique
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    // Ne pas exécuter sur le web ou si le retour haptique est désactivé
    if (Platform.OS === 'web' || !preferences.hapticFeedback) return;

    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      console.error('Erreur lors du déclenchement du retour haptique:', error);
    }
  }, [preferences.hapticFeedback]);

  // Réinitialiser toutes les préférences
  const resetPreferences = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.FONT_SIZE,
        STORAGE_KEYS.HIGH_CONTRAST,
        STORAGE_KEYS.REDUCE_MOTION,
        STORAGE_KEYS.HAPTIC_FEEDBACK,
        STORAGE_KEYS.SCREEN_READER_ENABLED,
        STORAGE_KEYS.VOICE_COMMANDS,
        STORAGE_KEYS.TEXT_TO_SPEECH,
      ]);

      setPreferences(DEFAULT_PREFERENCES);
      setThemeType(colorScheme === 'dark' ? 'dark' : 'light');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des préférences:', error);
    }
  }, [colorScheme, setThemeType]);

  // Charger les préférences au montage
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Retourner les préférences et les fonctions pour les modifier
  return {
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
}

export default useAccessibility;
