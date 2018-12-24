const path = require('path');

module.exports = function () {
  return {
    entry: './js/index.js',
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    module: {
      rules: [
        {
          test: /[\/]angular\.js$/, loader: "exports-loader?angular"
        }
      ]
    }
  }
};