import { LedgerBridgeApp } from './LedgerBridgeApp'

export class BitcoinLedgerBridgeApp extends LedgerBridgeApp {
  constructor () {
    super('BTC')
  }

  async signMessageNew (path, hex) {
    return await super.callToBridge({
      method: 'signMessageNew',
      callType: 'ASYNC_METHOD',
      payload: [path, hex]
    })
  }

  async getWalletPublicKey (path) {
    return await super.callToBridge({
      method: 'getWalletPublicKey',
      callType: 'ASYNC_METHOD',
      payload: [path]
    })
  }

  async splitTransaction (
    transactionHex,
    hasTimestamp = false,
    hasExtraData = false,
    additionals = []
  ) {
    return await super.callToBridge({
      method: 'splitTransaction',
      callType: 'METHOD',
      payload: [
        transactionHex,
        hasTimestamp,
        hasExtraData,
        additionals
      ]
    })
  }

  async createPaymentTransactionNew ({
    inputs,
    associatedKeysets,
    changePath,
    outputScriptHex,
    segwit,
    useTrustedInputForSegwit,
    additionals
  }) {
    return await super.callToBridge({
      method: 'createPaymentTransactionNew',
      callType: 'ASYNC_METHOD',
      payload: [
        {
          inputs,
          associatedKeysets,
          changePath,
          outputScriptHex,
          segwit,
          useTrustedInputForSegwit,
          additionals
        }
      ]
    })
  }

  async serializeTransactionOutputs (transaction) {
    const result = await super.callToBridge({
      method: 'serializeTransactionOutputs',
      callType: 'METHOD',
      payload: [transaction]
    })

    return {
      toString: function () {
        return [...new Uint8Array(result.data)]
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      }
    }
  }
}
