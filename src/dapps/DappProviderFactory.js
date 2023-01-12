import { EvmDappProvider } from './EvmDappProvider'

// maps the chainId with a specific dapp provider
export const DappProvidersMap = {
  [1]: EvmDappProvider
}

export class DappProviderFactory {
  _providers = {}

  resolve({ chainId }) {
    if (!this._providers[chainId]) {
      this._providers[chainId] = new DappProvidersMap[chainId]()
    }

    return this._providers[chainId]
  }
}
