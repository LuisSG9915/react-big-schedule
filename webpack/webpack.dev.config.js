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
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          "thread-loader", // Habilita hilos para procesamiento paralelo
          { loader: "babel-loader" },
        ],
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
    }),
    ...(isProduction
      ? [new CompressionWebpackPlugin(), new TerserPlugin()]
      : []),
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
  devtool: isProduction ? "source-map" : "eval-cheap-module-source-map", // Rápido para desarrollo
  cache: {
    type: "filesystem", // Usa caché del sistema de archivos
  },
  optimization: {
    minimize: isProduction, // Solo minimizar en producción
    minimizer: isProduction ? [new TerserPlugin()] : [],
  },
};  
