import buildConfig from '../build.config'
import LiqualitySwapDetails from '../swaps/liquality/SwapDetails'
import UniswapSwapDetails from '../swaps/uniswap/SwapDetails'

export const SwapProviderType = {
  LIQUALITY: 'LIQUALITY',
  UNISWAPV2: 'UNISWAPV2'
}

const SwapDetailsComponents = {
  [SwapProviderType.LIQUALITY]: LiqualitySwapDetails,
  [SwapProviderType.UNISWAPV2]: UniswapSwapDetails
}

export function getSwapProviderConfig (network, providerId) {
  return buildConfig.swapProviders[network][providerId]
}

export function getSwapDetailsComponent (network, providerId) {
  const config = getSwapProviderConfig(network, providerId)
  return SwapDetailsComponents[config.type]
}
