import buildConfig from '../build.config'

export const SwapProviderType = {
  LIQUALITY: 'LIQUALITY',
  UNISWAPV2: 'UNISWAPV2',
  ONEINCHV4: 'ONEINCHV4',
  THORCHAIN: 'THORCHAIN',
  LIQUALITYBOOST_TYPE1: 'LIQUALITYBOOST_TYPE1',
  LIQUALITYBOOST_TYPE2: 'LIQUALITYBOOST_TYPE2',
  FASTBTC: 'FASTBTC',
  SOVRYN: 'SOVRYN'
}

const swapProviderRoot = {
  [SwapProviderType.LIQUALITY]: 'swaps/liquality',
  [SwapProviderType.UNISWAPV2]: 'swaps/uniswap',
  [SwapProviderType.ONEINCHV4]: 'swaps/oneinch',
  [SwapProviderType.THORCHAIN]: 'swaps/thorchain',
  [SwapProviderType.FASTBTC]: 'swaps/fastbtc',
  [SwapProviderType.LIQUALITYBOOST_TYPE1]: 'swaps/liqualityboost/lbspNativeToERC20',
  [SwapProviderType.LIQUALITYBOOST_TYPE2]: 'swaps/liqualityboost/lbspERC20toNative',
  [SwapProviderType.SOVRYN]: 'swaps/sovryn'
}

export function getSwapProviderConfig(network, providerId) {
  return buildConfig.swapProviders[network][providerId]
}

export function getSwapProviderIcon(network, providerId) {
  const config = getSwapProviderConfig(network, providerId)
  return require(`../assets/icons/swapProviders/${config.icon}?inline`)
}

export function getSwapProviderInfo(network, providerId) {
  const config = getSwapProviderConfig(network, providerId)
  const root = swapProviderRoot[config.type]
  return require(`../${root}/info.json`)
}
