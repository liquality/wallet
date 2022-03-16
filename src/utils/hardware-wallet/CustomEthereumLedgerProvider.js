import { EthereumLedgerProvider } from '@liquality/ethereum-ledger-provider'
import { createTransportMixin } from './utils'

class CustomEthereumLedgerProvider extends EthereumLedgerProvider {
  constructor({ network, derivationPath, hardfork }) {
    super({ network, derivationPath, Transport: null, hardfork })
  }
}

Object.assign(CustomEthereumLedgerProvider.prototype, createTransportMixin)
export { CustomEthereumLedgerProvider }
