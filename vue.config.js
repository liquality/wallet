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
  }
}
