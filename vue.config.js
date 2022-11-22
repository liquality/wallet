const path = require('path')
const AssetReplacePlugin = require('./plugins/AssetReplacePlugin')
const CopyPlugin = require('copy-webpack-plugin')

const isDevelopment = process.env.NODE_ENV === 'development'

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

  configureWebpack: (config) => {
    config.entry.pageProvider = path.resolve('./src/pageProvider/index.js')
    config.plugins.push(
      new AssetReplacePlugin({
        name: '#PAGEPROVIDER#',
        entry: 'pageProvider'
      })
    )

    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            context: './src/locales',
            from: '**/messages.json',
            to({ context, absoluteFilename }) {
              return `_locales/${path.relative(context, absoluteFilename)}`
            }
          }
        ]
      })
    )

    config.optimization.splitChunks = {
      cacheGroups: {
        default: false
      }
    }
    if (isDevelopment) {
      config.devtool = 'cheap-source-map'
    }
  },

  chainWebpack: (config) => {
    config.resolve.alias.set('vue', path.resolve('./node_modules/vue'))
    config.resolve.alias.set('vuex', path.resolve('./node_modules/vuex'))

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

    config.module
      .rule('html')
      .test(/\.html$/)
      .use('raw-loader')
      .loader('raw-loader')

    config.module
      .rule('walletConnect')
      .test(/node_modules[\\/]@walletconnect/)
      .use('babel-loader')
      .loader('babel-loader')
  },

  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.js'
        },
        contentScripts: {
          entries: {
            'content-script': ['src/contentScript.js']
          }
        }
      },
      extensionReloaderOptions: {
        entries: {
          contentScript: ['pageProvider', 'content-script'],
          background: 'background'
        }
      },
      manifestTransformer: (manifest) => {
        manifest.content_security_policy =
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.segment.com 'sha256-ZgDy59Dh4jH9g/vcPYFpoQ1wumB4IdPEOS1BJc08i+Y='; object-src 'self';"
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
