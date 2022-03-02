import buildConfig from '../build.config'

export const SwapProviderType = {
  LIQUALITY: 'LIQUALITY',
  UNISWAPV2: 'UNISWAPV2',
  ONEINCHV4: 'ONEINCHV4',
  THORCHAIN: 'THORCHAIN',
  LIQUALITYBOOST_NATIVE_TO_ERC20: 'LIQUALITYBOOST_NATIVE_TO_ERC20',
  LIQUALITYBOOST_ERC20_TO_NATIVE: 'LIQUALITYBOOST_ERC20_TO_NATIVE',
  FASTBTC: 'FASTBTC',
  SOVRYN: 'SOVRYN',
  ASTROPORT: 'ASTROPORT'
}

const swapProviderRoot = {
  [SwapProviderType.LIQUALITY]: 'swaps/liquality',
  [SwapProviderType.UNISWAPV2]: 'swaps/uniswap',
  [SwapProviderType.ONEINCHV4]: 'swaps/oneinch',
  [SwapProviderType.THORCHAIN]: 'swaps/thorchain',
  [SwapProviderType.FASTBTC]: 'swaps/fastbtc',
  [SwapProviderType.LIQUALITYBOOST_NATIVE_TO_ERC20]:
    'swaps/liqualityboost/liqualityBoostNativeToERC20',
  [SwapProviderType.LIQUALITYBOOST_ERC20_TO_NATIVE]:
    'swaps/liqualityboost/liqualityBoostERC20toNative',
  [SwapProviderType.SOVRYN]: 'swaps/sovryn',
  [SwapProviderType.ASTROPORT]: 'swaps/astroport'
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
