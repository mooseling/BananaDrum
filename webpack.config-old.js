const path = require('path');

module.exports {
  mode: 'development',
  entry: {
    prod: './src/prod/index.tsx',
    test: './src/test/index.ts'
  },
  module: {
    rules: [{
      test: /\.[tj]sx?/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
  resolve: {
    extensions:['.ts', '.tsx', '.js', '.jsx']
  }
};