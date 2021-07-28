import { EthereumLedgerProvider } from '@liquality/ethereum-ledger-provider'
import { Address } from '@liquality/types'
import { remove0x } from '@liquality/ethereum-utils'
export class EthereumLedgerBridgeProvider extends EthereumLedgerProvider {
  _ledgerApp

  constructor ({ network, derivationPath, Transport }, ledgerApp) {
    super({ network, derivationPath, Transport })
    this._ledgerApp = new Proxy(ledgerApp, { get: this.errorProxy.bind(this) })
  }

  async getApp () {
    return Promise.resolve(this._ledgerApp)
  }

  async getAddresses () {
    const addresses = await super.getAddresses()
    return addresses.map(a => {
      const { address, derivationPath, publicKey } = a
      return new Address({
        address: remove0x(address),
        derivationPath,
        publicKey
      })
    })
  }
}
