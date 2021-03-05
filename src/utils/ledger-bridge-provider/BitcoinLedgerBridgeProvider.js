import BitcoinLedgerProvider from '@liquality/bitcoin-ledger-provider'
import { BitcoinLedgerBridgeApp } from './BitcoinLedgerBridgeApp'
import { version } from '../../../package.json'
import * as bitcoin from 'bitcoinjs-lib'
import { addressToString } from '@liquality/utils'
import {
  decodeRawTransaction
} from '@liquality/bitcoin-utils'

export class BitcoinLedgerBridgeProvider extends BitcoinLedgerProvider {
  _ledgerApp = null

  async getApp () {
    return new Promise((resolve) => {
      if (!this._ledgerApp) {
        this._ledgerApp = new Proxy(new BitcoinLedgerBridgeApp(), { get: this.errorProxy.bind(this) })
      }
      resolve(this._ledgerApp)
    })
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

  async signPSBT (data, inputs) {
    const psbt = bitcoin.Psbt.fromBase64(data, { network: this._network })
    const app = await this.getApp()

    const inputsArePubkey = psbt.txInputs.every((input, index) =>
      ['witnesspubkeyhash', 'pubkeyhash', 'p2sh-witnesspubkeyhash'].includes(psbt.getInputType(index))
    )

    if (inputsArePubkey && psbt.txInputs.length !== inputs.length) {
      throw new Error('signPSBT: Ledger must sign all inputs when they are all regular pub key hash payments.')
    }

    if (inputsArePubkey) {
      const ledgerInputs = await this.getLedgerInputs(psbt.txInputs.map(input => ({ txid: input.hash.reverse().toString('hex'), vout: input.index })))

      const getInputDetails = async (input) => {
        const txHex = await this.getMethod('getRawTransactionByHash')(input.hash.reverse().toString('hex'))
        const tx = decodeRawTransaction(txHex, this._network)
        const address = tx.vout[input.index].scriptPubKey.addresses[0]
        const walletAddress = await this.getWalletAddress(address)
        return walletAddress
      }

      const inputDetails = await Promise.all(psbt.txInputs.map(getInputDetails))
      const paths = inputDetails.map(i => i.derivationPath)
      const outputScript = await app.serializeTransactionOutputs({
        outputs: psbt.txOutputs.map(output => ({ script: output.script, amount: this.getAmountBuffer(output.value) }))
      })
      const outputScriptHex = outputScript.toString('hex')
      const isSegwit = ['bech32', 'p2sh-segwit'].includes(this._addressType)
      const changeAddress = await this.findAddress(psbt.txOutputs.map(output => output.address), true)

      const txHex = await app.createPaymentTransactionNew({
        inputs: ledgerInputs,
        associatedKeysets: paths,
        changePath: changeAddress && changeAddress.derivationPath,
        outputScriptHex,
        segwit: isSegwit,
        useTrustedInputForSegwit: isSegwit,
        additionals: this._addressType === 'bech32' ? ['bech32'] : []
      })

      const signedTransaction = bitcoin.Transaction.fromHex(txHex)

      psbt.setVersion(1) // Ledger payment txs use v1 and there is no option to change it - fuck knows why
      for (const input of inputs) {
        const signer = {
          network: this._network,
          publicKey: inputDetails[input.index].publicKey,
          sign: async () => {
            const sigInput = signedTransaction.ins[input.index]
            if (sigInput.witness.length) {
              return bitcoin.script.signature.decode(sigInput.witness[0]).signature
            } else return sigInput.script
          }
        }

        await psbt.signInputAsync(input.index, signer)
      }

      return psbt.toBase64()
    }

    const ledgerInputs = []
    const walletAddresses = []
    let isSegwit = false

    for (const input of inputs) {
      const walletAddress = await this.getDerivationPathAddress(input.derivationPath)
      walletAddresses.push(walletAddress)
      const { witnessScript, redeemScript } = psbt.data.inputs[input.index]
      const { hash: inputHash, index: inputIndex } = psbt.txInputs[input.index]
      const outputScript = witnessScript || redeemScript
      const inputTxHex = await this.getMethod('getRawTransactionByHash')(inputHash.reverse().toString('hex'))
      const ledgerInputTx = await app.splitTransaction(inputTxHex, true)
      ledgerInputs.push([ledgerInputTx, inputIndex, outputScript.toString('hex'), 0])
      if (witnessScript) isSegwit = true
    }

    const ledgerTx = await app.splitTransaction(psbt.__CACHE.__TX.toHex(), true)
    const ledgerOutputs = await app.serializeTransactionOutputs(ledgerTx)

    const ledgerSigs = await app.signP2SHTransaction({
      inputs: ledgerInputs,
      associatedKeysets: walletAddresses.map(address => address.derivationPath),
      outputScriptHex: ledgerOutputs.toString('hex'),
      lockTime: psbt.locktime,
      segwit: isSegwit,
      transactionVersion: 2
    })

    for (const input of inputs) {
      const signer = {
        network: this._network,
        publicKey: walletAddresses[input.index].publicKey,
        sign: async () => {
          const finalSig = isSegwit ? ledgerSigs[input.index] : ledgerSigs[input.index] + '01' // Is this a ledger bug? Why non segwit signs need the sighash appended?
          const { signature } = bitcoin.script.signature.decode(Buffer.from(finalSig, 'hex'))
          return signature
        }
      }

      await psbt.signInputAsync(input.index, signer)
    }

    return psbt.toBase64()
  }
}

BitcoinLedgerBridgeProvider.version = version
