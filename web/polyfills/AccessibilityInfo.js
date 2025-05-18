/**
 * Polyfill pour AccessibilityInfo dans l'environnement web
 * Ce fichier est utilisé pour résoudre l'erreur "Unable to resolve AccessibilityInfo"
 */

const AccessibilityInfo = {
  fetch: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  announceForAccessibility: () => {},
  isScreenReaderEnabled: () => Promise.resolve(false),
  getRecommendedTimeoutMillis: () => Promise.resolve(0),
  isBoldTextEnabled: () => Promise.resolve(false),
  isGrayscaleEnabled: () => Promise.resolve(false),
  isInvertColorsEnabled: () => Promise.resolve(false),
  isReduceMotionEnabled: () => Promise.resolve(false),
  isReduceTransparencyEnabled: () => Promise.resolve(false),
  isScreenReaderEnabled: () => Promise.resolve(false),
};

export default AccessibilityInfo;
