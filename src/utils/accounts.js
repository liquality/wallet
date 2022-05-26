import { getAssetIcon } from '@/utils/asset'

export const getAccountIcon = (chain) => {
  return {
    bitcoin: getAssetIcon('BTC'),
    ethereum: getAssetIcon('eth_account'),
    bsc: getAssetIcon('bnb_account', 'png'),
    rsk: getAssetIcon('rsk_account'),
    near: getAssetIcon('NEAR'),
    solana: getAssetIcon('SOL'),
    polygon: getAssetIcon('polygon_account'),
    arbitrum: getAssetIcon('ARBITRUM'),
    avalanche: getAssetIcon('AVAX'),
    terra: getAssetIcon('TERRA'),
    fuse: getAssetIcon('FUSE'),
    optimism: getAssetIcon('FUSE') // TODO
  }[chain]
}

export const getChainIcon = (chainId) => {
  return {
    bitcoin: getAssetIcon(`${chainId}_chain`),
    ethereum: getAssetIcon(`${chainId}_chain`),
    bsc: getAssetIcon(`${chainId}_chain`),
    rsk: getAssetIcon(`${chainId}_chain`),
    near: getAssetIcon(`${chainId}_chain`),
    solana: getAssetIcon('SOL'),
    polygon: getAssetIcon(`${chainId}_chain`),
    arbitrum: getAssetIcon('ARBITRUM'),
    avalanche: getAssetIcon('AVAX'),
    terra: getAssetIcon(`${chainId}_chain`),
    fuse: getAssetIcon('FUSE'),
    optimism: getAssetIcon('FUSE') // TODO
  }[chainId]
}
