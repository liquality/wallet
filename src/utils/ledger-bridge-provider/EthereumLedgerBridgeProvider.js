import EthereumLedgerProvider from '@liquality/ethereum-ledger-provider'
import { EthereumLedgerBridgeApp } from './EthereumLedgerBridgeApp'
import { version } from '../../../package.json'
import { Address } from '@liquality/utils'
import networks from '@liquality/ethereum-networks'

export class EthereumLedgerBridgeProvider extends EthereumLedgerProvider {
  _ledgerApp = null

  constructor (network = networks.mainnet) {
    super(network)
    this._baseDerivationPath = `44'/${network.coinType}`
  }

  async getApp () {
    return new Promise((resolve) => {
      if (!this._ledgerApp) {
        this._ledgerApp = new Proxy(new EthereumLedgerBridgeApp(), { get: this.errorProxy.bind(this) })
      }
      resolve(this._ledgerApp)
    })
  }

  async getAddresses (from, to) {
    const app = await this.getApp()
    if (from && to) {
      const addresses = []
      for (let i = from; i <= to; i++) {
        const path = `${this._baseDerivationPath}/${i}'/0/0`
        const address = await app.getAddress(path)
        addresses.push(new Address({
          address: address.address,
          derivationPath: path,
          publicKey: address.publicKey
        }))
      }
      return addresses
    } else {
      const path = `${this._baseDerivationPath}/0'/0/0`
      const address = await app.getAddress(path)
      return [
        new Address({
          address: address.address,
          derivationPath: path,
          publicKey: address.publicKey
        })
      ]
    }
  }
}

EthereumLedgerBridgeProvider.version = version
