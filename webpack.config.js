const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const plugins = [];
const production = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: 'react-diagrams'
  },
  devtool: production ? 'source-map' : 'cheap-module-eval-source-map',
  mode: production ? 'production' : 'development',
  plugins: production ? [new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' })] : [],
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
  plugins: plugins,
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
