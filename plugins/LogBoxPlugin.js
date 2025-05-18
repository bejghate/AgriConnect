/**
 * Plugin pour désactiver les avertissements LogBox spécifiques
 * Ce plugin est utilisé pour supprimer les avertissements qui ne sont pas pertinents
 * ou qui sont causés par des dépendances tierces
 */

const LogBoxPlugin = {
  // Fonction appelée au démarrage de l'application
  init: () => {
    if (typeof global !== 'undefined') {
      // Désactiver les avertissements spécifiques
      const originalConsoleError = console.error;
      console.error = (...args) => {
        // Liste des messages d'erreur à supprimer
        const suppressedWarnings = [
          // Avertissements d'accessibilité
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
          // Avertissements d'animation
          'registerAnimation',
          'Animated.timing(...).start with a function callback',
          // Avertissements de style
          'Unknown style property',
          // Avertissements d'import.meta
          'import.meta',
          // Avertissements de useImperativeHandle
          'useImperativeHandle',
          // Autres avertissements courants
          'Require cycle:',
          'Non-serializable values were found in the navigation state',
        ];

        // Vérifie si l'erreur contient un des avertissements à supprimer
        const shouldSuppress = suppressedWarnings.some(warning => {
          return args[0] && typeof args[0] === 'string' && args[0].includes(warning);
        });

        // Si ce n'est pas un avertissement à supprimer, affiche l'erreur normalement
        if (!shouldSuppress) {
          originalConsoleError(...args);
        }
      };

      // Désactiver les avertissements YellowBox/LogBox si disponible
      if (global.__DEV__) {
        try {
          const LogBox = require('react-native/Libraries/LogBox/LogBox');
          if (LogBox && LogBox.ignoreLogs) {
            LogBox.ignoreLogs([
              'Require cycle:',
              'Non-serializable values were found in the navigation state',
              'Animated: `useNativeDriver`',
              'Animated.event now requires a second argument for options',
              'Animated.timing(...).start with a function callback',
              'registerAnimation',
              'Unknown style property',
              'useImperativeHandle',
              'import.meta',
            ]);
          }
        } catch (e) {
          // LogBox peut ne pas être disponible dans certains environnements
          console.log('LogBox n\'est pas disponible pour ignorer les avertissements');
        }
      }
    }
  }
};

export default LogBoxPlugin;
