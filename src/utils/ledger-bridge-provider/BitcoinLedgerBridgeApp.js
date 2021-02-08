import { LedgerBridgeApp } from './LedgerBridgeApp'

export class BictoinLedgerBridgeApp extends LedgerBridgeApp {
  constructor () {
    super('BTC')
  }

  async signMessageNew (path, hex) {
    return await super.callAppMethod(
      'signMessageNew',
      path,
      hex
    )
  }
}
