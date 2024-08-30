path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'walschaerts.js',
//    path: path.resolve(__dirname, './'),
  },
  mode: 'production'
};
