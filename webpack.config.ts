const path = require("path");
const tsconfigPathsWebpackPlugin = require("tsconfig-paths-webpack-plugin");
const webpackNodeExternals = require("webpack-node-externals");

const buildPath = path.resolve(path.join(__dirname, "build"));

const config = {
  externals: [webpackNodeExternals()],
  target: "node",
  mode: "development",

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    modules: [path.resolve(__dirname), "src"],
    plugins: [
      new tsconfigPathsWebpackPlugin({
        configFile: "./tsconfig.json"
      })
    ]
  },

  entry: "app.ts",

  output: {
    path: buildPath,
    filename: "app.js",
    libraryTarget: "commonjs2"
  },

  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.tsx?$/,
        use: "source-map-loader"
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader"
      }
    ]
  },

  devtool: "inline-source-map",

  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  }
};

module.exports = config;
