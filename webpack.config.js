import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


const config = {
  mode: 'development',
  context: __dirname,
  entry: {
    prod: {
      import: './packages/bananadrum-webapp/dist/index.js',
      filename: 'bundle.js'
    }
    // test: './packages/bananadrum-core/src/test/index.ts'
  },
  output: {
    path: path.resolve(__dirname, './packages/bananadrum-webapp/www')
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        resolve: {
          fullySpecified: false
        },
        use: {
          loader: 'babel-loader',
          options:{
            presets: [
              [
                "@babel/env", //  this is the same as @babel/preset-env
                {
                  useBuiltIns: "usage",
                  corejs: 3,
                  targets: {"ios":"14.4"} //"> 0.5%, not dead"
                }
              ]
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
};

export default config;
