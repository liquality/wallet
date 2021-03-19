import EthereumLedgerProvider from '@liquality/ethereum-ledger-provider'
import { EthereumLedgerBridgeApp } from './EthereumLedgerBridgeApp'
import { version } from '../../../package.json'
import { Address } from '@liquality/utils'
import networks from '@liquality/ethereum-networks'

export class EthereumLedgerBridgeProvider extends EthereumLedgerProvider {
  _ledgerApp = null

  constructor (network = networks.mainnet) {
    super(network)
    this._baseDerivationPath = `44'/${network.coinType}'`
  }

  async getApp () {
    return new Promise((resolve) => {
      if (!this._ledgerApp) {
        this._ledgerApp = new Proxy(new EthereumLedgerBridgeApp(), { get: this.errorProxy.bind(this) })
      }
      resolve(this._ledgerApp)
    })
  }

  async getAddresses (startingIndex = 0, numAddresses = 1, change = false) {
    const app = await this.getApp()
    const addresses = []
    const to = startingIndex + numAddresses
    for (let i = startingIndex; i < to; i++) {
      const path = `${this._baseDerivationPath}/${i}'/0/0`
      const address = await app.getAddress(path)
      addresses.push(new Address({
        address: address.address,
        derivationPath: path,
        publicKey: address.publicKey
      }))
    }
    return addresses
  }
}

EthereumLedgerBridgeProvider.version = version
