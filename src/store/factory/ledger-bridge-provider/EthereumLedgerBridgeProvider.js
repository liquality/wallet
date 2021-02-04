import EthereumLedgerProvider from '@liquality/ethereum-ledger-provider'
import { EthereumLedgerBridgeApp } from './EthereumLedgerBridgeApp'
import { version } from '../../../../package.json'
import { Address } from '@liquality/utils'
export class EthereumLedgerBridgeProvider extends EthereumLedgerProvider {
  _ledgerApp = null
  _addresses = []

  async getApp () {
    return new Promise((resolve) => {
      if (!this._ledgerApp) {
        this._ledgerApp = new Proxy(new EthereumLedgerBridgeApp(), { get: this.errorProxy.bind(this) })
      }
      resolve(this._ledgerApp)
    })
  }

  async getAddresses () { // TODO: Retrieve given num addresses?
    if (this._addresses.length <= 0) {
      const app = await this.getApp()
      const path = this._baseDerivationPath + '/0/0'
      const address = await app.getAddress(path)
      this._addresses = [
        new Address({
          address: address.address,
          derivationPath: path,
          publicKey: address.publicKey
        })
      ]
    }

    return this._addresses
  }
}

EthereumLedgerBridgeProvider.version = version
