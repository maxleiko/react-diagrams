const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
  mode,
  entry: './src/index.ts',
  output: {
    filename: path.join('dist', 'index.js'),
    path: path.join(__dirname),
    libraryTarget: 'umd',
    library: '@leiko/react-diagrams'
  },
  devtool: mode === 'production' ? 'source-map' : 'cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': `"${mode}"` }),
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom'
    },
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: '_',
      root: '_'
    },
    mobx: {
      commonjs: 'mobx',
      commonjs2: 'mobx',
      amd: 'MobX',
      root: 'MobX'
    },
    'mobx-utils': {
      commonjs: 'mobx-utils',
      commonjs2: 'mobx-utils',
      amd: 'MobXUtils',
      root: 'MobXUtils'
    }
  },
  optimization: {
    minimizer: [
      // we specify a custom UglifyJsPlugin here to get source maps in production
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: false,
          ecma: 5,
          mangle: false
        },
        sourceMap: true
      })
    ]
  }
};
