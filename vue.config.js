const WorkerPlugin = require('worker-plugin')

module.exports = {
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
