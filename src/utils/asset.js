export const getChainFromAsset = asset => {
  if (['DAI', 'USDC', 'USDT'].includes(asset)) return 'ETH'

  return asset
}
