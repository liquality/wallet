import { enc as Enc, AES, lib as Lib } from 'crypto-js'

import { generateMnemonic } from 'bip39'
import localforage from 'localforage'
import { getClient } from './clients'

localforage.config({
  name: 'atomic-wallet-6'
})

const demoWallet = 'client wealth rough mom chimney gentle caution air devote sniff window margin'

let unlockedWallet

const clients = {}

const JsonFormatter = {
  stringify (cipherParams) {
    const jsonObj = {
      ct: cipherParams.ciphertext.toString(Enc.Base64)
    }

    if (cipherParams.iv) {
      jsonObj.iv = cipherParams.iv.toString()
    }

    if (cipherParams.salt) {
      jsonObj.s = cipherParams.salt.toString()
    }

    return JSON.stringify(jsonObj)
  },
  parse (jsonStr) {
    const jsonObj = JSON.parse(jsonStr)

    const cipherParams = Lib.CipherParams.create({
      ciphertext: Enc.Base64.parse(jsonObj.ct)
    })

    if (jsonObj.iv) {
      cipherParams.iv = Enc.Hex.parse(jsonObj.iv)
    }

    if (jsonObj.s) {
      cipherParams.salt = Enc.Hex.parse(jsonObj.s)
    }

    return cipherParams
  }
}

const WALLET = {
  async isReady () {
    return !!unlockedWallet
  },
  async getState () {
    if (unlockedWallet) {
      return 'UNLOCKED'
    } else {
      if (await localforage.getItem('encrypted_wallet')) return 'LOCKED'

      return 'NOWALLET'
    }
  },
  async unlock (key) {
    const state = await WALLET.getState()
    if (state !== 'LOCKED') return false

    const rawEncryptedWallet = await localforage.getItem('encrypted_wallet')
    const encryptedWallet = JsonFormatter.parse(rawEncryptedWallet)
    const decryptedWallet = AES.decrypt(encryptedWallet, key)

    unlockedWallet = decryptedWallet.toString(Enc.Utf8)
    if (!unlockedWallet) throw new Error('Invalid password')

    return 'UNLOCKED'
  },
  async create (key) {
    const state = await WALLET.getState()
    if (state !== 'NOWALLET') return false

    const wallet = generateMnemonic()

    unlockedWallet = wallet

    const rawEncryptedWallet = AES.encrypt(wallet, key)
    const encryptedWallet = JsonFormatter.stringify(rawEncryptedWallet)

    await localforage.setItem('encrypted_wallet', encryptedWallet)

    return 'UNLOCKED'
  },
  async demo () {
    unlockedWallet = demoWallet

    return 'UNLOCKED'
  }
}

addEventListener('message', async event => {
  let { id, chain, method, args, returnType } = event.data
  chain = chain.toUpperCase()

  if (chain === 'WALLET') {
    try {
      const result = await WALLET[method](...args)

      postMessage({
        id,
        result
      })
    } catch (error) {
      postMessage({
        id,
        error
      })
    }

    return
  }

  if (!WALLET.isReady()) throw new Error('Wallet is unavailable')

  try {
    if (!clients[chain]) {
      clients[chain] = getClient(chain, unlockedWallet)
    }

    const client = clients[chain]
    const [namespace, fnName] = method.split('.')
    let result = await client[namespace][fnName](...args)

    if (returnType) {
      switch (returnType) {
        case 'Address':
          result = result.address
          break

        case 'Addresses':
          result = result.map(item => item.address)
          break

        case 'BigNumber':
          result = result.toString()

          break
      }
    }

    postMessage({
      id,
      result
    })
  } catch (error) {
    postMessage({
      id,
      error
    })
  }
})
