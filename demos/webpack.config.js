const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './demos.tsx',
  output: {
    filename: 'demos.js',
    path: path.join(__dirname, '..', 'dist'),
    libraryTarget: 'umd',
    library: 'ReactDiagrams'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html'
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, '..', 'dist'),
    compress: true,
    port: 9000
  },
  devtool: 'cheap-module-eval-source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
        include: path.resolve(__dirname, '../')
      },
      {
        test: /\.css/,
        loaders: ['style-loader', 'css-loader'],
        include: path.resolve(__dirname, '../')
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [/node_modules\//]
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
        loader: 'file-loader'
      }
    ]
  },
  resolve: {
    alias: {
      '@leiko/react-diagrams': path.join(__dirname, '..', 'src')
    },
    extensions: ['.tsx', '.ts', '.js']
  },
};
