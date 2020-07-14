export const getChainFromAsset = asset => {
  if (['DAI', 'USDC', 'USDT'].includes(asset)) return 'ETH'

  return asset
}

export const getFeeLabelFromAsset = asset => getChainFromAsset(asset) === 'ETH' ? 'gwei' : 'sat/b'
