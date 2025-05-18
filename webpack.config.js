const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Ajouter des résolutions personnalisées pour les modules problématiques
  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || {};

  // Résoudre Platform pour l'environnement web
  config.resolve.alias['../Utilities/Platform'] = path.resolve(__dirname, 'web/polyfills/Platform.js');
  config.resolve.alias['../../Utilities/Platform'] = path.resolve(__dirname, 'web/polyfills/Platform.js');
  config.resolve.alias['../../../Utilities/Platform'] = path.resolve(__dirname, 'web/polyfills/Platform.js');
  config.resolve.alias['react-native/Libraries/Utilities/Platform'] = path.resolve(__dirname, 'web/polyfills/Platform.js');

  // Résoudre les problèmes d'accessibilité
  config.resolve.alias['../Components/AccessibilityInfo/AccessibilityInfo'] = path.resolve(__dirname, 'web/polyfills/AccessibilityInfo.js');
  config.resolve.alias['../../Components/AccessibilityInfo/AccessibilityInfo'] = path.resolve(__dirname, 'web/polyfills/AccessibilityInfo.js');
  config.resolve.alias['../../../Components/AccessibilityInfo/AccessibilityInfo'] = path.resolve(__dirname, 'web/polyfills/AccessibilityInfo.js');

  // Résoudre LogBox pour l'environnement web
  config.resolve.alias['react-native/Libraries/LogBox/LogBox'] = path.resolve(__dirname, 'web/polyfills/LogBox.js');

  // Résoudre Animated pour l'environnement web
  config.resolve.alias['react-native/Libraries/Animated/Animated'] = path.resolve(__dirname, 'web/polyfills/Animated.js');
  config.resolve.alias['react-native/Libraries/Animated/src/Animated'] = path.resolve(__dirname, 'web/polyfills/Animated.js');

  // Résoudre d'autres modules problématiques
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'react-native': 'react-native-web',
  };

  // Ignorer les avertissements pour certains modules
  config.ignoreWarnings = [
    /Failed to parse source map/,
    /Can't resolve '..\/Utilities\/Platform'/,
  ];

  return config;
};
