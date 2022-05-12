import { getSwapProviderConfig } from '@liquality/wallet-core/dist/swaps/utils'

export function getSwapProviderIcon(network, providerId) {
  const config = getSwapProviderConfig(network, providerId)
  return require(`../assets/icons/swapProviders/${config.icon}?inline`)
}
