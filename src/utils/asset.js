import cryptoassets from '@liquality/cryptoassets'

const EXPLORERS = {
  ETH: {
    testnet: 'https://rinkeby.etherscan.io/tx/0x',
    mainnet: 'https://etherscan.io/tx/0x'
  },
  BTC: {
    testnet: 'https://blockstream.info/testnet/tx/',
    mainnet: 'https://blockstream.info/tx/'
  }
}

export const isERC20 = asset => {
  return ['DAI', 'USDC', 'USDT', 'WBTC', 'UNI'].includes(asset)
}

export const getChainFromAsset = asset => {
  if (isERC20(asset)) return 'ETH'

  return asset
}

export const getAssetColorStyle = asset => {
  const assetData = cryptoassets[asset.toLowerCase()]
  if (assetData.color) return { color: assetData.color }
}

export const getExplorerLink = (hash, asset, network) => {
  const chain = getChainFromAsset(asset)
  return `${EXPLORERS[chain][network]}${hash}`
}
