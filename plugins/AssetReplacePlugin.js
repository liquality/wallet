const { RawSource } = require('webpack-sources')

class AssetReplacePlugin {
  // { name: 'replace-me', entry: 'entry to replace' }
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('AssetReplacePlugin', (compilation) => {
      compilation.hooks.afterOptimizeAssets.tap('AssetReplacePlugin', (assets) => {
        const replaceAsset = Object.entries(assets).find(([name]) => {
          return name.includes(this.options.entry)
        })
        if (replaceAsset) {
          const replaceAssetSource = replaceAsset[1].source()
          for (const file of Object.keys(assets)) {
            if (file.includes('.js')) {
              compilation.updateAsset(file, (old) => {
                const oldSource = old.source()
                if (oldSource.includes(this.options.name)) {
                  const newSource = oldSource
                    .split(new RegExp(`['"]?${this.options.name}['"]?`))
                    .join(JSON.stringify(replaceAssetSource))
                  return new RawSource(newSource)
                } else {
                  return old
                }
              })
            }
          }
        }
      })
    })
  }
}

module.exports = AssetReplacePlugin
