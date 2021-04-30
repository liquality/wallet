import EthereumLedgerProvider from '@liquality/ethereum-ledger-provider'
import { EthereumLedgerBridgeApp } from './EthereumLedgerBridgeApp'
import { version } from '../../../package.json'
import { EthereumNetworks } from '@liquality/ethereum-networks'
import { Address } from '@liquality/utils'

export class EthereumLedgerBridgeProvider extends EthereumLedgerProvider {
  _ledgerApp = null
  _bridgeUrl
  _addressesCache = {}

  constructor (network = EthereumNetworks.ethereum_mainnet, bridgeUrl) {
    super(network)
    this._bridgeUrl = bridgeUrl
    this._ledgerApp = new Proxy(new EthereumLedgerBridgeApp(this._bridgeUrl), { get: this.errorProxy.bind(this) })
  }

  async getApp () {
    return Promise.resolve(this._ledgerApp)
  }

  async getAddresses () { // TODO: Retrieve given num addresses?
    const app = await this.getApp()
    const path = this._baseDerivationPath + '/0/0'
    if (path in this._addressesCache) {
      return this._addressesCache[path]
    }

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

EthereumLedgerBridgeProvider.version = version
