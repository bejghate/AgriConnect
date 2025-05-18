/**
 * Désactive les avertissements liés à l'accessibilité dans React Native Web
 * Ce fichier est nécessaire pour éviter les erreurs de récursion infinie dans les hooks d'effet
 * liés à l'accessibilité sur le web.
 */

import { LogBox } from 'react-native';

export function disableAccessibilityWarnings() {
  // Désactiver les avertissements spécifiques liés à l'accessibilité
  LogBox.ignoreLogs([
    'AccessibilityInfo.isScreenReaderEnabled',
    'AccessibilityInfo.announceForAccessibility',
    'AccessibilityInfo.fetch',
    'AccessibilityInfo.addEventListener',
    'AccessibilityInfo.removeEventListener',
    'AccessibilityInfo.setAccessibilityFocus',
    'AccessibilityInfo.getRecommendedTimeoutMillis',
    'AccessibilityInfo.isBoldTextEnabled',
    'AccessibilityInfo.isGrayscaleEnabled',
    'AccessibilityInfo.isInvertColorsEnabled',
    'AccessibilityInfo.isReduceMotionEnabled',
    'AccessibilityInfo.isReduceTransparencyEnabled',
    'AccessibilityInfo.isScreenReaderEnabled',
  ]);
}

export default disableAccessibilityWarnings;
