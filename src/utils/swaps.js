import buildConfig from '../build.config'

export const SwapProviderType = {
  LIQUALITY: 'LIQUALITY',
  UNISWAPV2: 'UNISWAPV2',
  ONEINCHV3: 'ONEINCHV3',
  THORCHAIN: 'THORCHAIN'
}

export function getSwapProviderConfig (network, providerId) {
  return buildConfig.swapProviders[network][providerId]
}
