/**
 * Polyfill pour react-native Platform dans l'environnement web
 * Ce fichier est utilisé pour résoudre l'erreur "Unable to resolve "../Utilities/Platform"
 */

const Platform = {
  OS: 'web',
  select: (obj) => obj.web || obj.default || {},
  Version: 1,
  isTesting: false,
  isTV: false,
  isPad: false,
  isTablet: false,
  constants: {
    reactNativeVersion: {
      major: 0,
      minor: 0,
      patch: 0,
      prerelease: null,
    },
  },
};

export default Platform;
