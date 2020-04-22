import { v4 as uuidv4 } from 'uuid'
import { generateMnemonic } from 'bip39'
import localforage from 'localforage'

import { encrypt, decrypt } from './crypto'
import { getClient as createClient } from './clients'

localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'wallet',
  storeName: 'securewallets'
})

const demoWallet = 'client wealth rough mom chimney gentle caution air devote sniff window margin'

let unlockedWalletId
let unlockedWallet
let unlockedClients

function setUnlockedWallet (id, wallet) {
  unlockedClients = {}
  unlockedWalletId = id
  unlockedWallet = wallet
}

const WALLET = {
  async getWallet (id) {
    const rawEncryptedWallet = await localforage.getItem(id)
    const { name, at, imported } = JSON.parse(rawEncryptedWallet)

    return {
      id,
      name,
      at,
      imported
    }
  },
  async getListOfWallets () {
    const list = await localforage.keys()

    return Promise.all(list.map(id => this.getWallet(id)))
  },
  async getUnlockedWalletId () {
    return unlockedWalletId
  },
  async unlock (id, key) {
    const rawEncryptedWallet = await localforage.getItem(id)
    if (!rawEncryptedWallet) throw new Error('Invalid wallet id')

    const { name, encryptedWallet } = JSON.parse(rawEncryptedWallet)

    const _unlockedWallet = decrypt(encryptedWallet, key)
    if (!_unlockedWallet) throw new Error('Invalid password')

    setUnlockedWallet(id, _unlockedWallet)

    return {
      id,
      name
    }
  },
  async lock () {
    setUnlockedWallet(null, null)

    return {
      id: unlockedWalletId
    }
  },
  async generate (name, key) {
    const id = uuidv4()
    const wallet = generateMnemonic()
    const at = Date.now()

    const encryptedWallet = encrypt(wallet, key)
    await localforage.setItem(id, JSON.stringify({ name, at, encryptedWallet }))

    setUnlockedWallet(id, wallet)

    return {
      id,
      name,
      wallet
    }
  },
  async import (name, wallet, key) {
    const id = uuidv4()
    const at = Date.now()
    const imported = true

    const encryptedWallet = encrypt(wallet, key)
    await localforage.setItem(id, JSON.stringify({ name, at, encryptedWallet, imported }))

    setUnlockedWallet(id, wallet)

    return {
      id,
      name
    }
  },
  async demo () {
    setUnlockedWallet('demo', demoWallet)

    return {
      id: unlockedWalletId,
      name: 'demo'
    }
  }
}

const getClient = chain => {
  if (!unlockedClients[chain]) {
    unlockedClients[chain] = createClient(chain, unlockedWallet)
  }

  return unlockedClients[chain]
}

export {
  WALLET,
  getClient
}
