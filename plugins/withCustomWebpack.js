const { withExpoWebpack } = require('@expo/webpack-config/addons');

module.exports = function (config) {
  return withExpoWebpack(config, async (config) => {
    // Customize the Webpack config to handle ES modules
    config.output.environment = {
      ...config.output.environment,
      module: true,
    };

    // Add support for import.meta
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    // Set experiments to support top-level await and import.meta
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      outputModule: true,
    };

    return config;
  });
};
