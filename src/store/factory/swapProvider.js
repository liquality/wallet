import { SwapProviderType } from '@/utils/swaps'
import { LiqualitySwapProvider } from '@/swaps/liquality/LiqualitySwapProvider'
import { LiqualityBoostSwapProvider } from '@/swaps/liqualityboost/LiqualityBoostSwapProvider'
import { UniswapSwapProvider } from '@/swaps/uniswap/UniswapSwapProvider'
import { OneinchSwapProvider } from '@/swaps/oneinch/OneinchSwapProvider'
import { ThorchainSwapProvider } from '@/swaps/thorchain/ThorchainSwapProvider'
import { FastbtcSwapProvider } from '@/swaps/fastbtc/FastbtcSwapProvider'
import { SovrynSwapProvider } from '@/swaps/sovryn/SovrynSwapProvider'
import { AstroportSwapProvider } from '@/swaps/astroport/AstroportSwapProvider'
import buildConfig from '@/build.config'

const providers = {
  [SwapProviderType.LIQUALITY]: LiqualitySwapProvider,
  [SwapProviderType.UNISWAPV2]: UniswapSwapProvider,
  [SwapProviderType.ONEINCHV4]: OneinchSwapProvider,
  [SwapProviderType.THORCHAIN]: ThorchainSwapProvider,
  [SwapProviderType.LIQUALITYBOOST]: LiqualityBoostSwapProvider,
  [SwapProviderType.FASTBTC]: FastbtcSwapProvider,
  [SwapProviderType.SOVRYN]: SovrynSwapProvider,
  [SwapProviderType.ASTROPORT]: AstroportSwapProvider
}

export const createSwapProvider = (network, providerId) => {
  const swapProviderConfig = buildConfig.swapProviders[network][providerId]
  const SwapProvider = providers[swapProviderConfig.type]
  return new SwapProvider({ ...swapProviderConfig, providerId })
}
