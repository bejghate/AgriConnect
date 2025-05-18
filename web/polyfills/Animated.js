/**
 * Polyfill pour Animated dans l'environnement web
 * Ce fichier est utilisé pour résoudre les erreurs liées à Animated
 */

import { Animated as RNAnimated } from 'react-native';

// Wrapper autour de Animated pour intercepter les appels problématiques
const Animated = {
  ...RNAnimated,
  
  // Surcharge de timing pour gérer le callback
  timing: (value, config) => {
    return {
      ...RNAnimated.timing(value, config),
      start: (callback) => {
        // Si un callback est fourni, l'ignorer silencieusement
        if (callback && typeof callback === 'function') {
          console.log('Animated.timing().start() avec callback est déprécié. Utilisation sans callback.');
          RNAnimated.timing(value, config).start();
          return;
        }
        
        // Sinon, appeler normalement
        RNAnimated.timing(value, config).start(callback);
      }
    };
  },
  
  // Surcharge de event pour gérer le listener
  event: (argMapping, config = {}) => {
    // Ajouter un listener vide si aucun n'est fourni
    const newConfig = {
      ...config,
      listener: config.listener || (() => {})
    };
    
    return RNAnimated.event(argMapping, newConfig);
  }
};

export default Animated;
