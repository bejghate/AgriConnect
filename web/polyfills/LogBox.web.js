/**
 * Polyfill pour LogBox.web dans l'environnement web
 * Ce fichier est utilisé pour résoudre l'erreur "Unable to resolve LogBox.web"
 */

// Implémentation vide de LogBox pour l'environnement web
const LogBox = {
  ignoreLogs: () => {},
  ignoreAllLogs: () => {},
  install: () => {},
  uninstall: () => {},
};

export default LogBox;
