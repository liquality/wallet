import { BitcoinLedgerProvider } from '@liquality/bitcoin-ledger-provider'
import { bitcoin } from '@liquality/types'
import { address } from 'bitcoinjs-lib'

export class BitcoinLedgerBridgeProvider extends BitcoinLedgerProvider {
  _ledgerApp

  constructor ({
    network,
    Transport,
    baseDerivationPath,
    addressType,
    basePublicKey,
    baseChainCode,
    ledgerApp
  }) {
    super({
      network,
      Transport,
      baseDerivationPath,
      addressType
    })
    this._ledgerApp = ledgerApp
    if (basePublicKey && baseChainCode) {
      this._walletPublicKeyCache = {
        [baseDerivationPath]: {
          publicKey: basePublicKey,
          chainCode: baseChainCode
        }
      }
    }
  }

  async getApp () {
    return Promise.resolve(this._ledgerApp)
  }

  async _buildTransaction (targets, feePerByte, fixedInputs) {
    const app = await this.getApp()

    const unusedAddress = await this.getUnusedAddress(true)
    const { inputs, change, fee } = await this.getInputsForAmount(
      targets,
      feePerByte,
      fixedInputs
    )
    const ledgerInputs = await this.getLedgerInputs(inputs)
    const paths = inputs.map(utxo => utxo.derivationPath)

    const outputs = targets.map(output => {
      const outputScript =
        output.script || address.toOutputScript(output.address, this._network)
      return {
        amount: this.getAmountBuffer(output.value),
        script: outputScript
      }
    })

    if (change) {
      outputs.push({
        amount: this.getAmountBuffer(change.value),
        script: address.toOutputScript(unusedAddress.address, this._network)
      })
    }

    const transactionOutput = await app.serializeTransactionOutputs({ outputs })
    const outputScriptHex = transactionOutput.toString('hex')
    const isSegwit = [
      bitcoin.AddressType.BECH32,
      bitcoin.AddressType.P2SH_SEGWIT
    ].includes(this._addressType)

    const txHex = await app.createPaymentTransactionNew({
      // @ts-ignore
      inputs: ledgerInputs,
      associatedKeysets: paths,
      changePath: unusedAddress.derivationPath,
      outputScriptHex,
      segwit: isSegwit,
      useTrustedInputForSegwit: isSegwit,
      additionals:
        this._addressType === bitcoin.AddressType.BECH32 ? ['bech32'] : []
    })

    return { hex: txHex, fee }
  }
}
