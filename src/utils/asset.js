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
  },
  BNB: {
    testnet: {
      tx: 'https://testnet.bscscan.com/tx/',
      address: 'https://testnet.bscscan.com/address/'
    },
    mainnet: {
      tx: 'https://bscscan.com/tx/',
      address: 'https://bscscan.com/address/'
    }
  }
}

export const isERC20 = asset => {
  return cryptoassets[asset]?.type === 'erc20'
}

export const isEthereumChain = asset => {
  return ['ETH', 'RBTC', 'BNB'].includes(asset)
}

export const getChainFromAsset = asset => {
  if (isERC20(asset)) {
    if (cryptoassets[asset]?.network === 'ethereum') return 'ETH'
    if (cryptoassets[asset]?.network === 'rsk') return 'RBTC'
  }

  return asset
}

export const getAssetColorStyle = asset => {
  const assetData = cryptoassets[asset]
  if (assetData && assetData.color) {
    return { color: assetData.color }
  }
  // return black as default
  return { color: '#000000' }
}

export const getTransactionExplorerLink = (hash, asset, network) => {
  const chain = getChainFromAsset(asset)
  return `${EXPLORERS[chain][network].tx}${hash}`
}

export const getAddressExplorerLink = (address, asset, network) => {
  const chain = getChainFromAsset(asset)
  return `${EXPLORERS[chain][network].address}${address}`
}

export const getAssetIcon = (asset, extension = 'svg') => {
  try {
    return require(`../assets/icons/assets/${asset.toLowerCase()}.${extension}?inline`)
  } catch (e) {
    try {
      return require(`../../node_modules/cryptocurrency-icons/svg/color/${asset.toLowerCase()}.svg?inline`)
    } catch (e) {
      return require('../assets/icons/blank_asset.svg?inline')
    }
  }
}
