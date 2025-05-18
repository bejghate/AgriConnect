// plugins/exclude-maps-web.js
const { withDangerousMod } = require('@expo/config-plugins');
const { resolve } = require('path');
const fs = require('fs');

// Plugin pour exclure react-native-maps de la version web
module.exports = (config) => {
  return withDangerousMod(config, [
    'web',
    async (config) => {
      const webpackConfigPath = resolve(config.modRequest.projectRoot, 'node_modules', 'expo', 'webpack.config.js');
      
      try {
        // Vérifier si le fichier existe
        if (fs.existsSync(webpackConfigPath)) {
          let webpackConfig = fs.readFileSync(webpackConfigPath, 'utf8');
          
          // Ajouter une règle pour exclure react-native-maps
          if (!webpackConfig.includes('react-native-maps')) {
            const aliasSection = webpackConfig.indexOf('alias: {');
            if (aliasSection !== -1) {
              const insertPosition = webpackConfig.indexOf('}', aliasSection);
              const aliasAddition = `
      // Exclude react-native-maps on web
      'react-native-maps': 'react-native-web',`;
              
              webpackConfig = webpackConfig.slice(0, insertPosition) + aliasAddition + webpackConfig.slice(insertPosition);
              fs.writeFileSync(webpackConfigPath, webpackConfig);
              console.log('Successfully excluded react-native-maps from web build');
            }
          }
        }
      } catch (error) {
        console.error('Error excluding react-native-maps from web build:', error);
      }
      
      return config;
    },
  ]);
};
