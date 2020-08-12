import cryptoassets from '@liquality/cryptoassets'

export const getChainFromAsset = asset => {
  if (['DAI', 'USDC', 'USDT', 'WBTC'].includes(asset)) return 'ETH'

  return asset
}

export const getAssetColorStyle = asset => {
  const assetData = cryptoassets[asset.toLowerCase()]
  if (assetData.color) return { color: assetData.color }
}

const EXPLORERS = {
  ETH: {
    testnet: 'https://rinkeby.etherscan.io/tx/0x',
    mainnet: 'https://etherscan.io/tx/0x'
  },
  BTC: {
    testnet: 'https://blockstream.info/tx/',
    mainnet: 'https://blockstream.info/testnet/tx/'
  }
}

export const getExplorerLink = (hash, asset, network) => {
  const chain = getChainFromAsset(asset)
  return `${EXPLORERS[chain][network]}${hash}`
}
