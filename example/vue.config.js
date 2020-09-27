const path = require('path');

module.exports = {
  outputDir: path.resolve(__dirname, '../docs'),
  chainWebpack: (config) => {
    config.resolve.alias.set('vue$', path.join(__dirname, 'node_modules/vue'));
  },
};