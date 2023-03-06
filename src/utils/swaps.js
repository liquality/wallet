import { getSwapProviderConfig } from '@liquality/wallet-core/dist/src/swaps/utils'

export function getSwapProviderIcon(network, providerId) {
  const config = getSwapProviderConfig(network, providerId)
  return require(`@/assets/icons/swapProviders/${config.icon}?inline`)
}
