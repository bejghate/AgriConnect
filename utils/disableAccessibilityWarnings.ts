/**
 * Désactive les avertissements d'accessibilité dans la console
 * Ces avertissements sont souvent liés à React Native Paper et peuvent encombrer la console
 */
export const disableAccessibilityWarnings = () => {
  // Sauvegarde de la fonction console.error originale
  const originalConsoleError = console.error;

  // Remplace console.error pour filtrer les avertissements d'accessibilité
  console.error = (...args: any[]) => {
    // Filtre les avertissements d'accessibilité spécifiques
    const suppressedWarnings = [
      'accessibilityLabel',
      'accessibilityHint',
      'accessibilityRole',
      'accessible',
      'accessibilityState',
      'accessibilityValue',
      'accessibilityActions',
      'accessibilityLiveRegion',
      'importantForAccessibility',
      'aria-',
      'role',
    ];

    // Vérifie si l'erreur contient un des avertissements à supprimer
    const shouldSuppress = suppressedWarnings.some(warning => {
      return args[0] && typeof args[0] === 'string' && args[0].includes(warning);
    });

    // Si ce n'est pas un avertissement d'accessibilité, affiche l'erreur normalement
    if (!shouldSuppress) {
      originalConsoleError(...args);
    }
  };
};
