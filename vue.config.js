const WorkerPlugin = require('worker-plugin')

module.exports = {
  lintOnSave: false,
  css: {
    loaderOptions: {
      sass: {
        prependData: '@import "@/assets/scss/_vars.scss";'
      }
    }
  },
  configureWebpack: {
    plugins: [
      new WorkerPlugin()
    ]
  }
}
