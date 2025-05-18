/**
 * Polyfill pour react-native LogBox dans l'environnement web
 * Ce fichier est utilisé pour résoudre l'erreur "Unable to resolve LogBox"
 */

const LogBox = {
  ignoreLogs: (patterns) => {
    // Implémentation vide pour l'environnement web
    console.log('LogBox.ignoreLogs polyfill called with:', patterns);
  },
  ignoreAllLogs: (value) => {
    // Implémentation vide pour l'environnement web
    console.log('LogBox.ignoreAllLogs polyfill called with:', value);
  },
  install: () => {
    // Implémentation vide pour l'environnement web
    console.log('LogBox.install polyfill called');
  },
  uninstall: () => {
    // Implémentation vide pour l'environnement web
    console.log('LogBox.uninstall polyfill called');
  },
};

export default LogBox;
