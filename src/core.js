import { setupWallet } from '@liquality/wallet-core'
import { AES } from 'crypto-js'
import _pbkdf2 from 'pbkdf2'
import { createNotification as _createNotification } from './utils/notification'

async function pbkdf2(password, salt, iterations, length, digest) {
  return new Promise((resolve, reject) => {
    _pbkdf2.pbkdf2(password, salt, iterations, length, digest, (err, derivedKey) => {
      if (err) reject(err)
      else resolve(Buffer.from(derivedKey).toString('hex'))
    })
  })
}

const walletOptions = {
  crypto: {
    pbkdf2,
    async encrypt(value, key) {
      return AES.encrypt(value, key)
    },
    async decrypt(value, key) {
      return AES.decrypt(value, key)
    }
  },
  createNotification(notification) {
    _createNotification(notification)
  }
}

const wallet = setupWallet(walletOptions)

export default wallet
