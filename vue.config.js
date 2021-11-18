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

  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg')

    svgRule.uses.clear()

    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('svg-url-loader')
      .loader('svg-url-loader')
      .end()
      .end()
      .oneOf('external')
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .options({
        svgo: {
          plugins: [{ removeViewBox: false }, { removeDimensions: true }]
        }
      })
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
        manifest.content_security_policy = "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.segment.com 'sha256-ZgDy59Dh4jH9g/vcPYFpoQ1wumB4IdPEOS1BJc08i+Y='; object-src 'self';"
        manifest.externally_connectable = {
          matches: [`${process.env.VUE_APP_LEDGER_BRIDGE_URL}/*`]
        }
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
