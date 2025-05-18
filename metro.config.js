// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Obtenir la configuration par défaut
const defaultConfig = getDefaultConfig(__dirname);

// Ajouter les extensions web
defaultConfig.resolver.sourceExts = [
  ...defaultConfig.resolver.sourceExts,
  'web.js',
  'web.ts',
  'web.tsx',
];

// Ajouter des résolveurs personnalisés
defaultConfig.resolver.extraNodeModules = {
  ...defaultConfig.resolver.extraNodeModules,
  '../Utilities/Platform': path.resolve(__dirname, 'web/polyfills/Platform.js'),
  '../../Utilities/Platform': path.resolve(__dirname, 'web/polyfills/Platform.js'),
  'react-native/Libraries/Utilities/Platform': path.resolve(__dirname, 'web/polyfills/Platform.js'),
  'react-native/Libraries/LogBox/LogBox': path.resolve(__dirname, 'web/polyfills/LogBox.js'),
};

// Ajouter des résolveurs de plateformes personnalisés
defaultConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  // Résoudre Platform pour l'environnement web
  if (platform === 'web' && (
    moduleName === '../Utilities/Platform' ||
    moduleName === '../../Utilities/Platform' ||
    moduleName === 'react-native/Libraries/Utilities/Platform'
  )) {
    return {
      filePath: path.resolve(__dirname, 'web/polyfills/Platform.js'),
      type: 'sourceFile',
    };
  }

  // Résoudre LogBox pour l'environnement web
  if (platform === 'web' && moduleName === 'react-native/Libraries/LogBox/LogBox') {
    return {
      filePath: path.resolve(__dirname, 'web/polyfills/LogBox.js'),
      type: 'sourceFile',
    };
  }

  // Remplacer react-native-maps par notre mock sur le web
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: path.resolve(__dirname, 'mocks/react-native-maps.js'),
      type: 'sourceFile',
    };
  }

  // Utiliser le résolveur par défaut pour tous les autres modules
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = defaultConfig;
