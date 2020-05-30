module.exports = {
  lintOnSave: false,

  css: {
    loaderOptions: {
      sass: {
        prependData: '@import "@/assets/scss/_vars.scss";'
      }
    }
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
