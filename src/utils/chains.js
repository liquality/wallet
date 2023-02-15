import { ChainId as ChainName, Network } from '@liquality/cryptoassets'

export const chainIdsMapping = {
  eip155: {
    [42161]: `${ChainName.Arbitrum}:${Network.Mainnet}`,
    [421613]: `${ChainName.Arbitrum}:${Network.Testnet}`,
    [43114]: `${ChainName.Avalanche}:${Network.Mainnet}`,
    [43113]: `${ChainName.Avalanche}:${Network.Testnet}`,
    [56]: `${ChainName.BinanceSmartChain}:${Network.Mainnet}`,
    [97]: `${ChainName.BinanceSmartChain}:${Network.Testnet}`,
    [1]: `${ChainName.Ethereum}:${Network.Mainnet}`,
    [5]: `${ChainName.Ethereum}:${Network.Testnet}`,
    [122]: `${ChainName.Fuse}:${Network.Mainnet}`,
    [123]: `${ChainName.Fuse}:${Network.Testnet}`,
    [10]: `${ChainName.Optimism}:${Network.Mainnet}`,
    [420]: `${ChainName.Optimism}:${Network.Testnet}`,
    [137]: `${ChainName.Polygon}:${Network.Mainnet}`,
    [80001]: `${ChainName.Polygon}:${Network.Testnet}`,
    [30]: `${ChainName.Rootstock}:${Network.Mainnet}`,
    [31]: `${ChainName.Rootstock}:${Network.Testnet}`
  },
  bip122: {
    ['000000000019d6689c085ae165831e93']: `${ChainName.Bitcoin}:${Network.Mainnet}`,
    ['000000000933ea01ad0ee984209779ba']: `${ChainName.Bitcoin}:${Network.Testnet}`
  }
}

// return the list of supported namespaces
export const chainNamespaces = Object.keys(chainIdsMapping)

// Convertion to support mapping from chain name and network to valid chain Ids
export const chainNameNetworkMapping = Object.keys(chainIdsMapping).reduce((p, c) => {
  const chains = Object.entries(chainIdsMapping[c])
    .map((c) => ({ [`${c[1].replace(':', '_')}`]: c[0] }))
    .reduce((prev, curr) => {
      const val = Object.entries(curr)
      prev[val[0][0]] = val[0][1]
      return prev
    }, {})
  p[c] = chains
  return p
}, {})

/**
 *
 * @param {String} namespace
 * @param {String} chainName
 * @param {String} networkName
 * @returns Number
 */
export const getChainId = (namespace, chainName, networkName) => {
  return chainNameNetworkMapping[namespace]?.[chainName]?.[networkName]
}

/**
 *
 * @param {String | Number} chainId
 * @returns Number
 */
export const parseChainId = (chainId) => {
  return `${chainId}`.toUpperCase().startsWith('0X') ? parseInt(`${chainId}`, 16) : chainId
}

/**
 *
 * @param {string} namespace
 * @param {String|Number} chainId
 * @returns { name: 'The Chain Name', networkName: 'Mainnet | Testnet'}
 */
export const getChainInfo = (namespace, chainId) => {
  const chain = chainIdsMapping[namespace][parseChainId(chainId)]
  if (chain) {
    const values = chain.split(':')
    return {
      name: values[0],
      networkName: values[1]
    }
  }
  return null
}
