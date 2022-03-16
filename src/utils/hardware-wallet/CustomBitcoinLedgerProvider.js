import { BitcoinLedgerProvider } from '@liquality/bitcoin-ledger-provider'
import { createTransportMixin } from './utils'

class CustomBitcoinLedgerProvider extends BitcoinLedgerProvider {
  constructor({ network, baseDerivationPath, addressType, basePublicKey, baseChainCode }) {
    super({
      network,
      Transport: null,
      baseDerivationPath,
      addressType
    })
    if (basePublicKey && baseChainCode) {
      this._walletPublicKeyCache = {
        [baseDerivationPath]: {
          publicKey: basePublicKey,
          chainCode: baseChainCode
        }
      }
    }
  }

  // async _buildTransaction(targets, feePerByte, fixedInputs) {
  //   const app = await this.getApp()

  //   const unusedAddress = await this.getUnusedAddress(true)
  //   const { inputs, change, fee } = await this.getInputsForAmount(targets, feePerByte, fixedInputs)
  //   const ledgerInputs = await this.getLedgerInputs(inputs)
  //   const paths = inputs.map((utxo) => utxo.derivationPath)

  //   const outputs = targets.map((output) => {
  //     const outputScript = output.script || address.toOutputScript(output.address, this._network)
  //     return {
  //       amount: this.getAmountBuffer(output.value),
  //       script: outputScript
  //     }
  //   })

  //   if (change) {
  //     outputs.push({
  //       amount: this.getAmountBuffer(change.value),
  //       script: address.toOutputScript(unusedAddress.address, this._network)
  //     })
  //   }

  //   const transactionOutput = await app.serializeTransactionOutputs({ outputs })
  //   const outputScriptHex = transactionOutput.toString('hex')
  //   const isSegwit = [bitcoin.AddressType.BECH32, bitcoin.AddressType.P2SH_SEGWIT].includes(
  //     this._addressType
  //   )

  //   const txHex = await app.createPaymentTransactionNew({
  //     // @ts-ignore
  //     inputs: ledgerInputs,
  //     associatedKeysets: paths,
  //     changePath: unusedAddress.derivationPath,
  //     outputScriptHex,
  //     segwit: isSegwit,
  //     useTrustedInputForSegwit: isSegwit,
  //     additionals: this._addressType === bitcoin.AddressType.BECH32 ? ['bech32'] : []
  //   })

  //   return { hex: txHex, fee }
  // }
}


Object.assign(CustomBitcoinLedgerProvider.prototype, createTransportMixin)
export { CustomBitcoinLedgerProvider }
