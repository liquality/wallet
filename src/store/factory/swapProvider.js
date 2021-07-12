import { SwapProviderType } from '@/utils/swaps'
import { LiqualitySwapProvider } from '@/swaps/liquality/LiqualitySwapProvider'
import { UniswapSwapProvider } from '@/swaps/uniswap/UniswapSwapProvider'
import { ThorchainSwapProvider } from '@/swaps/thorchain/ThorchainSwapProvider'
import buildConfig from '@/build.config'

export const createSwapProvider = (network, providerId) => {
  const swapProviderConfig = buildConfig.swapProviders[network][providerId]

  if (swapProviderConfig.type === SwapProviderType.LIQUALITY) return new LiqualitySwapProvider({ providerId, agent: swapProviderConfig.agent })
  if (swapProviderConfig.type === SwapProviderType.UNISWAPV2) return new UniswapSwapProvider({ providerId, routerAddress: swapProviderConfig.routerAddress })
  if (swapProviderConfig.type === SwapProviderType.THORCHAIN) return new ThorchainSwapProvider({ providerId, thornode: swapProviderConfig.thornode })
}
