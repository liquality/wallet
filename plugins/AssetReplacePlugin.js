const { RawSource } = require('webpack-sources')

class AssetReplacePlugin {
  // { name: 'replace-me', entry: 'entry to replace' }
  constructor(options) {
    this.options = options
    this.chunkVersions = {}
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('AssetReplacePlugin', (compilation) => {
      compilation.hooks.optimizeChunkAssets.tap('AssetReplacePlugin', (chunks) => {
        let replaceAssetSource
        for (const chunk of chunks) {
          const file = chunk.files.find((file) => file.includes(this.options.entry))
          if (file) {
            replaceAssetSource = compilation.assets[file].source()
            break
          }
        }

        if (replaceAssetSource) {
          for (const chunk of chunks) {
            for (const file of chunk.files) {
              if (file.includes('.js')) {
                compilation.updateAsset(file, (old) => {
                  const oldSource = old.source()
                  if (oldSource.includes(this.options.name)) {
                    const newSource = oldSource
                      .split(new RegExp(`['"]?${this.options.name}['"]?`))
                      .join(JSON.stringify(replaceAssetSource))
                    const finalSource = new RawSource(newSource)
                    return finalSource
                  } else {
                    return old
                  }
                })
              }
            }
          }
        }
      })
    })
  }
}

module.exports = AssetReplacePlugin
