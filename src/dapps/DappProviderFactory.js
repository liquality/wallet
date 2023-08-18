import { EvmDappProvider } from './EvmDappProvider'
import store from '../store'
// maps the chainId with a specific dapp provider
export const DappProvidersMap = {
  'eip155:1': EvmDappProvider,
  'eip155:5': EvmDappProvider,
  'eip155:42': EvmDappProvider
}

export class DappProviderFactory {
  static _providers = {}

  static resolve({ chainId }) {
    if (!DappProviderFactory._providers[chainId]) {
      DappProviderFactory._providers[chainId] = new DappProvidersMap[chainId](chainId, store)
    }

    return DappProviderFactory._providers[chainId]
  }
}
