const WorkerPlugin = require('worker-plugin')

module.exports = {
  publicPath: './',
  lintOnSave: false,
  productionSourceMap: false,
  css: {
    loaderOptions: {
      sass: {
        prependData: '@import "@/assets/scss/_vars.scss";'
      }
    }
  },
  configureWebpack: {
    plugins: [
      new WorkerPlugin({
        globalObject: 'self'
      })
    ]
  },
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');
  }
}
