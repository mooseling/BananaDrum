const config = {
  mode: 'development',
  entry: {
    prod: './index.js',
    // test: './packages/bananadrum-core/src/test/index.ts'
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.[tj]sx?/,
  //       loader: 'ts-loader'
  //     }
  //   ]
  // },
  // resolve: {
  //   extensions: ['.ts', '.tsx', '.js', '.jsx'],
  //   extensionAlias: {
  //     '.js': ['.js', '.ts'],
  //     '.jsx': ['.jsx', '.tsx']
  //    }
  // }
};

export default config;
