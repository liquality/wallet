import cryptoassets from '../utils/cryptoassets'

const EXPLORERS = {
  ETH: {
    testnet: {
      tx: 'https://rinkeby.etherscan.io/tx/0x',
      address: 'https://rinkeby.etherscan.io/address/'
    },
    mainnet: {
      tx: 'https://etherscan.io/tx/0x',
      address: 'https://etherscan.io/address/'
    }
  },
  BTC: {
    testnet: {
      tx: 'https://blockstream.info/testnet/tx/',
      address: 'https://blockstream.info/testnet/address/'
    },
    mainnet: {
      tx: 'https://blockstream.info/tx/',
      address: 'https://blockstream.info/address/'
    }
  },
  RBTC: {
    testnet: {
      tx: 'https://explorer.testnet.rsk.co/tx/0x',
      address: 'https://explorer.testnet.rsk.co/address/'
    },
    mainnet: {
      tx: 'https://explorer.rsk.co/tx/0x',
      address: 'https://explorer.rsk.co/address/'
    }
  }
}

export const isERC20 = asset => {
  return cryptoassets[asset].type === 'erc20'
}

export const getChainFromAsset = asset => {
  if (isERC20(asset)) return 'ETH'

  return asset
}

export const getAssetColorStyle = asset => {
  const assetData = cryptoassets[asset]
  if (assetData.color) return { color: assetData.color }
}

export const getTransactionExplorerLink = (hash, asset, network) => {
  const chain = getChainFromAsset(asset)
  return `${EXPLORERS[chain][network].tx}${hash}`
}

export const getAddressExplorerLink = (address, asset, network) => {
  const chain = getChainFromAsset(asset)
  return `${EXPLORERS[chain][network].address}${address}`
}

export const getAssetIcon = (asset) => {
  try {
    return require(`../assets/icons/assets/${asset.toLowerCase()}.svg?inline`)
  } catch (e) {
    try {
      return require(`../../node_modules/cryptocurrency-icons/svg/color/${asset.toLowerCase()}.svg?inline`)
    } catch (e) {
      return require('../assets/icons/blank_asset.svg?inline')
    }
  }
}
