import { SwapProviderType } from '@/utils/swaps'
import { LiqualitySwapProvider } from '@/swaps/liquality/LiqualitySwapProvider'
import { LiqualityBoostERC20toNative } from '@/swaps/liqualityboost/liqualityBoostERC20toNative/LiqualityBoostERC20toNative'
import { LiqualityBoostNativeToERC20 } from '@/swaps/liqualityboost/liqualityBoostNativeToERC20/LiqualityBoostNativeToERC20'
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
  [SwapProviderType.LIQUALITYBOOST_NATIVE_TO_ERC20]: LiqualityBoostNativeToERC20,
  [SwapProviderType.LIQUALITYBOOST_ERC20_TO_NATIVE]: LiqualityBoostERC20toNative,
  [SwapProviderType.FASTBTC]: FastbtcSwapProvider,
  [SwapProviderType.SOVRYN]: SovrynSwapProvider,
  [SwapProviderType.ASTROPORT]: AstroportSwapProvider
}

export const createSwapProvider = (network, providerId) => {
  const swapProviderConfig = buildConfig.swapProviders[network][providerId]
  const SwapProvider = providers[swapProviderConfig.type]
  return new SwapProvider({ ...swapProviderConfig, providerId })
}
