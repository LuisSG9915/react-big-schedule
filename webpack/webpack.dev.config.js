/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProduction ? "production" : "development",
  entry: "./src/examples/index.jsx",
  output: {
    path: path.resolve(__dirname, "..", "dist"),
    filename: "bundle.js",
    publicPath: "/",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      title: "React Big Schedule",
      hash: true,
    }),
    ...(isProduction
      ? []
      : [new ESLintWebpackPlugin({ extensions: ["js", "jsx"] })]),
  ],
  devServer: {
    static: path.join(__dirname, "..", "dist"),
    historyApiFallback: true,
    hot: true, // Habilita Hot Module Replacement para recarga rápida
    port: 5173,
  },
  devtool: false, // Disable source maps for faster build
  cache: false,
  optimization: {
    minimize: false,
  },
};  
