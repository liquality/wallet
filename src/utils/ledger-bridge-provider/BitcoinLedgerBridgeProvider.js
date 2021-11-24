import { BitcoinLedgerProvider } from '@liquality/bitcoin-ledger-provider'
import { BTC_ADDRESS_TYPE_TO_PREFIX } from '@/utils/address'

export class BitcoinLedgerBridgeProvider extends BitcoinLedgerProvider {
  _ledgerApp

  constructor ({
    network,
    Transport,
    baseDerivationPath,
    addressType
  },
  ledgerApp,
  publicKey) {
    super({
      network,
      Transport,
      baseDerivationPath,
      addressType
    })
    this._ledgerApp = new Proxy(ledgerApp, { get: this.errorProxy.bind(this) })
    if (publicKey) {
      const chainCode = BTC_ADDRESS_TYPE_TO_PREFIX[addressType]
      this._walletPublicKeyCache[baseDerivationPath] = {
        publicKey,
        chainCode
      }
    }
  }

  async getApp () {
    return Promise.resolve(this._ledgerApp)
  }
}
