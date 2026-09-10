const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

require('dotenv').config();

// Micro "Catálogo": exibe os livros cadastrados no crudcrud e expõe
// <App /> para o shell do BookHub consumir via Module Federation.
module.exports = (env, argv) => ({
  entry: './src/index.js',
  mode: argv.mode || 'development',
  devServer: {
    port: 3001,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  output: {
    // Em produção (Vercel), defina PUBLIC_URL com a URL publicada deste
    // micro (ex: https://bookhub-micro-catalogo.vercel.app) — precisa
    // bater com a URL real, senão os chunks internos (vendors, módulo
    // exposto) não são encontrados pelo runtime do Module Federation.
    publicPath: process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/` : 'http://localhost:3001/',
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
        // Exclui node_modules, EXCETO o pacote @bookhub/shared do monorepo
        // (que precisa passar pelo Babel para ter os tipos removidos).
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
    new webpack.DefinePlugin({
      'process.env.CRUDCRUD_URL': JSON.stringify(process.env.CRUDCRUD_URL || ''),
      // Usado pelo cliente (src/api.js) para montar a URL do proxy
      // /api/livros em produção — precisa ser o mesmo valor usado acima
      // em output.publicPath.
      'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL || ''),
    }),
    new ModuleFederationPlugin({
      name: 'micro_catalogo',
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
