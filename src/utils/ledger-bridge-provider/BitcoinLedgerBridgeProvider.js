import BitcoinLedgerProvider from '@liquality/bitcoin-ledger-provider'
import { BitcoinLedgerBridgeApp } from './BitcoinLedgerBridgeApp'
import { version } from '../../../package.json'
import * as bitcoin from 'bitcoinjs-lib'
import { addressToString } from '@liquality/utils'
import networks from '@liquality/ethereum-networks'

export class BitcoinLedgerBridgeProvider extends BitcoinLedgerProvider {
  _ledgerApp = null
  _bridgeUrl

  constructor (network = networks.bitcoin, addressType = 'bech32', bridgeUrl) {
    super(network, addressType)
    this._bridgeUrl = bridgeUrl
    this._ledgerApp = new Proxy(new BitcoinLedgerBridgeApp(this._bridgeUrl), { get: this.errorProxy.bind(this) })
  }

  async getApp () {
    return Promise.resolve(this._ledgerApp)
  }

  async _buildTransaction (_outputs, feePerByte, fixedInputs) {
    const app = await this.getApp()

    const unusedAddress = await this.getUnusedAddress(true)
    const { inputs, change, fee } = await this.getInputsForAmount(_outputs, feePerByte, fixedInputs)
    const ledgerInputs = await this.getLedgerInputs(inputs)
    const paths = inputs.map(utxo => utxo.derivationPath)

    const outputs = _outputs.map(output => {
      const outputScript = Buffer.isBuffer(output.to) ? output.to : bitcoin.address.toOutputScript(output.to, this._network) // Allow for OP_RETURN
      return { amount: this.getAmountBuffer(output.value), script: outputScript }
    })

    if (change) {
      outputs.push({
        amount: this.getAmountBuffer(change.value),
        script: bitcoin.address.toOutputScript(addressToString(unusedAddress), this._network)
      })
    }

    const outputScript = await app.serializeTransactionOutputs({ outputs })
    const outputScriptHex = outputScript.toString('hex')
    const isSegwit = ['bech32', 'p2sh-segwit'].includes(this._addressType)

    const txHex = await app.createPaymentTransactionNew({
      inputs: ledgerInputs,
      associatedKeysets: paths,
      changePath: unusedAddress.derivationPath,
      outputScriptHex,
      segwit: isSegwit,
      useTrustedInputForSegwit: isSegwit,
      additionals: this._addressType === 'bech32' ? ['bech32'] : []
    })

    return { hex: txHex, fee }
  }

  async getLedgerInputs (unspentOutputs) {
    const app = await this.getApp()

    return Promise.all(unspentOutputs.map(async utxo => {
      const hex = await this.getMethod('getTransactionHex')(utxo.txid)
      const tx = await app.splitTransaction(hex, true)
      return [tx, utxo.vout, undefined, 0]
    }))
  }
}

BitcoinLedgerBridgeProvider.version = version
