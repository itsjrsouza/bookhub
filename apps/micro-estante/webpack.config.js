const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

require('dotenv').config();

// Micro "Estante": mostra os livros que o usuário adicionou à estante
// pessoal e expõe <App /> para o shell do BookHub consumir via Module
// Federation.
module.exports = (env, argv) => ({
  entry: './src/index.js',
  mode: argv.mode || 'development',
  devServer: {
    port: 3002,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  output: {
    // Em produção (Vercel), defina PUBLIC_URL com a URL publicada deste
    // micro (ex: https://bookhub-micro-estante.vercel.app).
    publicPath: process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/` : 'http://localhost:3002/',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules\/(?!@bookhub)/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'micro_estante',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
});
