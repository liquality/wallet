import {
  chains,
  isEthereumChain as _isEthereumChain
} from '@liquality/cryptoassets'
import cryptoassets from '@/utils/cryptoassets'
import * as ethers from 'ethers'
import axios from 'axios'
import tokenABI from './tokenABI.json'
import buildConfig from '../build.config'

const EXPLORERS = {
  ethereum: {
    testnet: {
      tx: 'https://ropsten.etherscan.io/tx/0x{hash}',
      address: 'https://ropsten.etherscan.io/address/{hash}'
    },
    mainnet: {
      tx: 'https://etherscan.io/tx/0x{hash}',
      address: 'https://etherscan.io/address/{hash}'
    }
  },
  bitcoin: {
    testnet: {
      tx: 'https://blockstream.info/testnet/tx/{hash}',
      address: 'https://blockstream.info/testnet/address/{hash}'
    },
    mainnet: {
      tx: 'https://blockstream.info/tx/{hash}',
      address: 'https://blockstream.info/address/{hash}'
    }
  },
  rsk: {
    testnet: {
      tx: 'https://explorer.testnet.rsk.co/tx/0x{hash}',
      address: 'https://explorer.testnet.rsk.co/address/{hash}'
    },
    mainnet: {
      tx: 'https://explorer.rsk.co/tx/0x{hash}',
      address: 'https://explorer.rsk.co/address/{hash}'
    }
  },
  bsc: {
    testnet: {
      tx: 'https://testnet.bscscan.com/tx/{hash}',
      address: 'https://testnet.bscscan.com/address/{hash}'
    },
    mainnet: {
      tx: 'https://bscscan.com/tx/{hash}',
      address: 'https://bscscan.com/address/{hash}'
    }
  },
  polygon: {
    testnet: {
      tx: 'https://polygonscan.com/tx/0x{hash}',
      address: 'https://polygonscan.com/address/{hash}'
    },
    mainnet: {
      tx: 'https://polygonscan.com/tx/0x{hash}',
      address: 'https://polygonscan.com/address/{hash}'
    }
  },
  near: {
    testnet: {
      tx: 'https://explorer.testnet.near.org/transactions/{hash}',
      address: 'https://explorer.testnet.near.org/accounts/{hash}'
    },
    mainnet: {
      tx: 'https://explorer.mainnet.near.org/transactions/{hash}',
      address: 'https://explorer.mainnet.near.org/accounts/{hash}'
    }
  },
  solana: {
    testnet: {
      tx: 'https://explorer.solana.com/tx/{hash}?cluster=devnet',
      address: 'https://explorer.solana.com/address/{hash}?cluster=devnet'
    },
    mainnet: {
      tx: 'https://explorer.solana.com/tx/{hash}',
      address: 'https://explorer.solana.com/address/{hash}'
    }
  },
  arbitrum: {
    testnet: {
      tx: 'https://rinkeby-explorer.arbitrum.io/tx/0x{hash}',
      address: 'https://rinkeby-explorer.arbitrum.io/address/{hash}'
    },
    mainnet: {
      tx: 'https://explorer.arbitrum.io/tx/0x{hash}',
      address: 'https://explorer.arbitrum.io/address/{hash}'
    }
  },
  terra: {
    testnet: {
      tx: 'https://finder.terra.money/bombay-12/tx/{hash}',
      address: 'https://finder.terra.money/bombay-12/address/{hash}'
    },
    mainnet: {
      tx: 'https://finder.terra.money/columbus-5/tx/{hash}',
      address: 'https://finder.terra.money/columbus-5/address/{hash}'
    }
  }
}

export const isERC20 = asset => {
  return cryptoassets[asset]?.type === 'erc20'
}

export const isEthereumChain = asset => {
  const chain = cryptoassets[asset]?.chain
  return _isEthereumChain(chain)
}

export const isEthereumNativeAsset = asset => {
  const chainId = cryptoassets[asset]?.chain
  if (
    chainId &&
    _isEthereumChain(chainId) &&
    chains[chainId].nativeAsset === asset
  ) {
    return true
  }

  return false
}

export const getNativeAsset = asset => {
  const chainId = cryptoassets[asset]?.chain
  return chainId ? chains[chainId].nativeAsset : asset
}

export const getFeeAsset = asset => {
  return cryptoassets[asset]?.feeAsset
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
  const transactionHash = getExplorerTransactionHash(asset, hash)
  const chain = cryptoassets[asset].chain
  const link = `${EXPLORERS[chain][network].tx}`

  return link.replace('{hash}', transactionHash)
}

export const getAddressExplorerLink = (address, asset, network) => {
  const chain = cryptoassets[asset].chain
  const link = `${EXPLORERS[chain][network].address}`

  return link.replace('{hash}', address)
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

export const getExplorerTransactionHash = (asset, hash) => {
  switch (asset) {
    case 'NEAR':
      return hash.split('_')[0]
    default:
      return hash
  }
}

export const tokenDetailProviders = {
  ethereum: {
    async getDetails (contractAddress) {
      return await fetchTokenDetails(contractAddress, `https://mainnet.infura.io/v3/${buildConfig.infuraApiKey}`)
    }
  },
  polygon: {
    async getDetails (contractAddress) {
      return await fetchTokenDetails(contractAddress, 'https://polygon-rpc.com')
    }
  },
  rsk: {
    async getDetails (contractAddress) {
      return await fetchTokenDetails(contractAddress, process.env.VUE_APP_SOVRYN_RPC_URL_MAINNET)
    }
  },
  bsc: {
    async getDetails (contractAddress) {
      return await fetchTokenDetails(contractAddress, 'https://bsc-dataseed.binance.org')
    }
  },
  arbitrum: {
    async getDetails (contractAddress) {
      return await fetchTokenDetails(contractAddress, 'https://arb1.arbitrum.io/rpc')
    }
  },
  terra: {
    async getDetails (contractAddress) {
      return await fetchTerraToken(contractAddress, 'https://arb1.arbitrum.io/rpc')
    }
  }
}

const fetchTokenDetails = async (contractAddress, rpcUrl) => {
  const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl)
  const contract = new ethers.Contract(contractAddress.toLowerCase(), tokenABI, provider)

  const [decimals, name, symbol] = await Promise.all([
    contract.decimals(),
    contract.name(),
    contract.symbol()
  ])

  return { decimals, name, symbol }
}

export const estimateGas = async ({ data, to, value }) => {
  const paramsForGasEstimate = {
    data,
    to,
    value
  }

  const provider = ethers.getDefaultProvider()

  return await provider.estimateGas(paramsForGasEstimate)
}

export const fetchTerraToken = async (address) => {
  const { data: { mainnet: tokens } } = await axios.get('https://assets.terra.money/cw20/tokens.json')
  const token = tokens[address]
  const { symbol } = token

  return {
    name: symbol,
    symbol,
    decimals: 6
  }
}
