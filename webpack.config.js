const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = function () {
  return {
    entry: './index.js',
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    module: {
      rules: [
        {
          test: /[\/]angular\.js$/, loader: "exports-loader?angular"
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader"
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].css",
      })
    ]
  }
};