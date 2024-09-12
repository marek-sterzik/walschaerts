path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'walschaerts.js',
    path: __dirname + '/public',
  },
  mode: 'development',

};
