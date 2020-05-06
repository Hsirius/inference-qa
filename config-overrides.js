const {
  override,
  addWebpackAlias,
  addLessLoader,
  fixBabelImports,
  disableEsLint,
  addWebpackModuleRule,
  addBundleVisualizer,
} = require('customize-cra');

module.exports = {
  webpack: override(
    addWebpackAlias({ '@/': './src', 'react-dom': '@hot-loader/react-dom' }), // 路径别名
    addLessLoader({
      javascriptEnabled: true,
    }),
    // 按需加载ant
    fixBabelImports('antd', {
      style: true,
      libraryDirectory: 'es',
    }),
    // 将捆绑包可视化工具插件添加到您的webpack配置中。
    addBundleVisualizer({}, true),
    process.env.NODE_ENV === 'production' && disableEsLint(),
    // 将提供的规则添加到webpack配置的module.rules数组中。
    process.env.NODE_ENV === 'production' &&
      addWebpackModuleRule({
        test: /\.js/,
        include: /node_modules(?:\/|\\)react-dom/,
        use: ['react-hot-loader/webpack'],
      }),
  ),
};
