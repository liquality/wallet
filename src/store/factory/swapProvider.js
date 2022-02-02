import { SwapProviderType } from '@/utils/swaps'
import { LiqualitySwapProvider } from '@/swaps/liquality/LiqualitySwapProvider'
import { LbspERC20toNative } from '@/swaps/liqualityboost/lbspERC20toNative/LbspERC20toNative'
import { LbspNativeToERC20 } from '@/swaps/liqualityboost/lbspNativeToERC20/LbspNativeToERC20'
import { UniswapSwapProvider } from '@/swaps/uniswap/UniswapSwapProvider'
import { OneinchSwapProvider } from '@/swaps/oneinch/OneinchSwapProvider'
import { ThorchainSwapProvider } from '@/swaps/thorchain/ThorchainSwapProvider'
import { FastbtcSwapProvider } from '@/swaps/fastbtc/FastbtcSwapProvider'
import { SovrynSwapProvider } from '@/swaps/sovryn/SovrynSwapProvider'
import buildConfig from '@/build.config'

const providers = {
  [SwapProviderType.LIQUALITY]: LiqualitySwapProvider,
  [SwapProviderType.UNISWAPV2]: UniswapSwapProvider,
  [SwapProviderType.ONEINCHV4]: OneinchSwapProvider,
  [SwapProviderType.THORCHAIN]: ThorchainSwapProvider,
  [SwapProviderType.LIQUALITYBOOST_TYPE1]: LbspERC20toNative,
  [SwapProviderType.LIQUALITYBOOST_TYPE2]: LbspNativeToERC20,
  [SwapProviderType.FASTBTC]: FastbtcSwapProvider,
  [SwapProviderType.SOVRYN]: SovrynSwapProvider
}

export const createSwapProvider = (network, providerId) => {
  console.log('network, providerId', network, providerId)
  const swapProviderConfig = buildConfig.swapProviders[network][providerId]
  const SwapProvider = providers[swapProviderConfig.type]
  return new SwapProvider({ ...swapProviderConfig, providerId })
}
