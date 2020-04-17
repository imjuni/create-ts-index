const webpack = require('webpack');
const path = require('path');
const tsconfigPathsWebpackPlugin = require('tsconfig-paths-webpack-plugin');
const webpackNodeExternals = require('webpack-node-externals');
const webpackBar = require('webpackbar');

const distPath = path.resolve(path.join(__dirname, 'dist'));

const config = {
  devtool: 'eval-source-map',
  externals: [
    webpackNodeExternals({
      whitelist: ['tslib'],
    }),
  ],
  mode: 'development',
  target: 'node',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    plugins: [
      new tsconfigPathsWebpackPlugin({
        configFile: 'tsconfig.json',
      }),
    ],
  },

  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node --harmony', raw: true }),
    new webpackBar({ name: '-create-ts-index' })
  ],

  entry: {
    'cti': ['./src/cti.ts'],
  },

  output: {
    filename: 'cti.js',
    libraryTarget: 'commonjs',
    path: distPath,
  },

  optimization: {
    minimize: false, // <---- disables uglify.
    // minimizer: [new UglifyJsPlugin()] if you want to customize it.
  },

  module: {
    rules: [
      {
        loader: 'json-loader',
        test: /\.json$/,
      },
      {
        exclude: /node_modules/,
        loader: 'ts-loader',
        test: /\.tsx?$/,
        options: {
          configFile: 'tsconfig.json'
        }
      },
    ],
  },

  devtool: 'inline-source-map',

  node: {
    __dirname: false,
    __filename: false,
    console: false,
    global: false,
    process: false,
  },
};

module.exports = config;
