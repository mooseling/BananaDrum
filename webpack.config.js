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
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
};

export default config;
