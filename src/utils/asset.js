import cryptoassets from '@liquality/cryptoassets'

export const getChainFromAsset = asset => {
  if (['DAI', 'USDC', 'USDT', 'WBTC'].includes(asset)) return 'ETH'

  return asset
}

export const getAssetColorStyle = asset => {
  const assetData = cryptoassets[asset.toLowerCase()]
  if (assetData.color) return { color: assetData.color }
}
