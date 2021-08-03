import { SwapProviderType } from '@/utils/swaps'
import { LiqualitySwapProvider } from '@/swaps/liquality/LiqualitySwapProvider'
import { UniswapSwapProvider } from '@/swaps/uniswap/UniswapSwapProvider'
import { OneinchSwapProvider } from '@/swaps/oneinch/OneinchSwapProvider'
import { ThorchainSwapProvider } from '@/swaps/thorchain/ThorchainSwapProvider'
import { FastbtcSwapProvider } from '@/swaps/fastbtc/FastbtcSwapProvider'
import buildConfig from '@/build.config'

const providers = {
  [SwapProviderType.LIQUALITY]: LiqualitySwapProvider,
  [SwapProviderType.UNISWAPV2]: UniswapSwapProvider,
  [SwapProviderType.ONEINCHV3]: OneinchSwapProvider,
  [SwapProviderType.THORCHAIN]: ThorchainSwapProvider,
  [SwapProviderType.FASTBTC]: FastbtcSwapProvider
}

export const createSwapProvider = (network, providerId) => {
  const swapProviderConfig = buildConfig.swapProviders[network][providerId]
  const SwapProvider = providers[swapProviderConfig.type]
  return new SwapProvider({ ...swapProviderConfig, providerId })
}
