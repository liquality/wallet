module.exports = {
  lintOnSave: false,

  css: {
    loaderOptions: {
      sass: {
        prependData: '@import "@/assets/scss/_vars.scss";'
      }
    }
  },

  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.js'
        },
        contentScripts: {
          entries: {
            'content-script': [
              'src/contentScript.js'
            ]
          }
        }
      },
      manifestTransformer: manifest => {
        manifest.content_security_policy = "script-src 'self' 'unsafe-eval'; object-src 'self'"

        return manifest
      }
    }
  },

  pages: {
    popup: {
      template: 'public/index.html',
      entry: './src/main.js',
      title: 'Liquality Wallet'
    },
    standalone: {
      template: 'public/index.html',
      entry: './src/main.js',
      title: 'Liquality Wallet',
      filename: 'index.html'
    }
  }
}
