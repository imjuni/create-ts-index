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
      allowlist: ['tslib'],
    }),
  ],
  mode: 'production',
  target: 'node',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    fallback: {
      __dirname: false,
      __filename: false,
      console: false,
      global: false,
      process: false,
    },
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    plugins: [
      new tsconfigPathsWebpackPlugin({
        configFile: 'tsconfig.prod.json',
      }),
    ],
  },

  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    new webpackBar({ name: '-create-ts-index' }),
  ],

  entry: {
    cti: ['./src/cti.ts'],
  },

  output: {
    filename: 'cti.js',
    libraryTarget: 'commonjs',
    path: distPath,
  },

  optimization: {
    minimize: true, // <---- disables uglify.
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
          configFile: 'tsconfig.prod.json',
        },
      },
      // {
      //   exclude: /node_modules/,
      //   loader: 'shebang-loader',
      //   test: /\.tsx?$/,
      // },
    ],
  },
};

module.exports = config;
