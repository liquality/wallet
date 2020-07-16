export const getChainFromAsset = asset => {
  if (['DAI', 'USDC', 'USDT', 'WBTC'].includes(asset)) return 'ETH'

  return asset
}
