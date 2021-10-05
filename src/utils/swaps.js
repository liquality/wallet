import buildConfig from '../build.config'

export const SwapProviderType = {
  LIQUALITY: 'LIQUALITY',
  UNISWAPV2: 'UNISWAPV2',
  ONEINCHV3: 'ONEINCHV3',
  THORCHAIN: 'THORCHAIN',
  LIQUALITYBOOST: 'LIQUALITYBOOST',
  FASTBTC: 'FASTBTC',
  SOVRYN: 'SOVRYN'
}

const swapProviderRoot = {
  [SwapProviderType.LIQUALITY]: 'swaps/liquality',
  [SwapProviderType.UNISWAPV2]: 'swaps/uniswap',
  [SwapProviderType.ONEINCHV3]: 'swaps/oneinch',
  [SwapProviderType.THORCHAIN]: 'swaps/thorchain',
  [SwapProviderType.FASTBTC]: 'swaps/fastbtc',
  [SwapProviderType.LIQUALITYBOOST]: 'swaps/liqualityboost',
  [SwapProviderType.SOVRYN]: 'swaps/sovryn'
}

export function getSwapProviderConfig (network, providerId) {
  return buildConfig.swapProviders[network][providerId]
}

export function getSwapProviderIcon (network, providerId) {
  const config = getSwapProviderConfig(network, providerId)
  return require(`../assets/icons/swapProviders/${config.icon}?inline`)
}

export function getSwapProviderInfo (network, providerId) {
  const config = getSwapProviderConfig(network, providerId)
  const root = swapProviderRoot[config.type]
  return require(`../${root}/info.json`)
}
