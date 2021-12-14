import { BitcoinLedgerProvider } from '@liquality/bitcoin-ledger-provider'
import { fromBase58 } from 'bip32'
import { bitcoin } from '@liquality/types'
import { address } from 'bitcoinjs-lib'

export class BitcoinLedgerBridgeProvider extends BitcoinLedgerProvider {
  _ledgerApp
  _xPub
  _index

  constructor (
    { network, Transport, baseDerivationPath, addressType, xPub, ledgerApp }
  ) {
    super({
      network,
      Transport,
      baseDerivationPath,
      addressType
    })
    this._ledgerApp = new Proxy(ledgerApp, { get: this.errorProxy.bind(this) })
    this._xPub = xPub
    this._index = parseInt(baseDerivationPath.split('/')[2].replace('\'', ''))
  }

  async getApp () {
    return Promise.resolve(this._ledgerApp)
  }

  async getWalletPublicKey (path) {
    console.log('getWalletPublicKey', path)
    if (path in this._walletPublicKeyCache) {
      return this._walletPublicKeyCache[path]
    }

    let walletPublicKey
    if (this._xPub) {
      const index = parseInt(path.split('/')[2].replace('\'', ''))
      const derivationNode = fromBase58(
        this._xPub, this._network
      ).derive(index)

      const bitcoinAddress = this.getAddressFromPublicKey(derivationNode.publicKey)

      walletPublicKey = {
        bitcoinAddress,
        chainCode: derivationNode.chainCode.toString('hex'),
        publicKey: derivationNode.publicKey.toString('hex')
      }

      console.log('walletPublicKey', walletPublicKey)
    } else {
      walletPublicKey = await this._getWalletPublicKey(path)
    }

    this._walletPublicKeyCache[path] = walletPublicKey
    return walletPublicKey
  }

  async _buildTransaction (
    targets,
    feePerByte,
    fixedInputs
  ) {
    const app = await this.getApp()

    const unusedAddress = await this.getUnusedAddress(true)
    const { inputs, change, fee } = await this.getInputsForAmount(targets, feePerByte, fixedInputs)
    const ledgerInputs = await this.getLedgerInputs(inputs)
    const paths = inputs.map((utxo) => utxo.derivationPath)

    const outputs = targets.map((output) => {
      const outputScript = output.script || address.toOutputScript(output.address, this._network)
      return { amount: this.getAmountBuffer(output.value), script: outputScript }
    })

    if (change) {
      outputs.push({
        amount: this.getAmountBuffer(change.value),
        script: address.toOutputScript(unusedAddress.address, this._network)
      })
    }

    const transactionOutput = await app.serializeTransactionOutputs({ outputs })
    const outputScriptHex = transactionOutput.toString('hex')
    const isSegwit = [bitcoin.AddressType.BECH32, bitcoin.AddressType.P2SH_SEGWIT].includes(this._addressType)

    const txHex = await app.createPaymentTransactionNew({
      // @ts-ignore
      inputs: ledgerInputs,
      associatedKeysets: paths,
      changePath: unusedAddress.derivationPath,
      outputScriptHex,
      segwit: isSegwit,
      useTrustedInputForSegwit: isSegwit,
      additionals: this._addressType === bitcoin.AddressType.BECH32 ? ['bech32'] : []
    })

    return { hex: txHex, fee }
  }
}
