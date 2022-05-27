import cryptoassets from '@liquality/wallet-core/dist/utils/cryptoassets'

export const getAssetIcon = (asset, extension = 'svg') => {
  const _asset = cryptoassets[asset]?.matchingAsset ?? asset

  try {
    return require(`../assets/icons/assets/${_asset.toLowerCase()}.${extension}?inline`)
  } catch (e) {
    try {
      return require(`../../node_modules/cryptocurrency-icons/svg/color/${_asset.toLowerCase()}.svg?inline`)
    } catch (e) {
      return require('../assets/icons/blank_asset.svg?inline')
    }
  }
}
