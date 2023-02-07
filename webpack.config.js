const config = {
  mode: 'development',
  entry: {
    prod: './index.js',
    // test: './packages/bananadrum-core/src/test/index.ts'
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
