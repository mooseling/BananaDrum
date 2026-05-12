import path from 'path';
import { fileURLToPath } from 'url';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = true;

const config = {
  mode: 'development',
  context: __dirname,

  entry: './packages/bananadrum-webapp/src/index.ts',

  output: {
    path: path.resolve(__dirname, './packages/bananadrum-webapp/www'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: false,
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  useBuiltIns: 'usage',
                  corejs: 3,
                  targets: { ios: '14.4' },
                },
              ],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              isDev && require.resolve('react-refresh/babel'),
            ].filter(Boolean),
          },
        },
      },
    ],
  },

  plugins: [
    isDev && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),

  devServer: {
    static: {
      directory: path.resolve(
        __dirname,
        './packages/bananadrum-webapp/www'
      ),
    },
    allowedHosts: 'all',
    // watchFiles: [
    //   'packages/bananadrum-core/src/**/*',
    //   'packages/bananadrum-player/src/**/*',
    //   'packages/bananadrum-ui/src/**/*',
    //   'packages/bananadrum-webapp/src/**/*',
    // ],
    hot: true,
    historyApiFallback: true,
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
};

export default config;
