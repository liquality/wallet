import { enc as Enc, AES, lib as Lib } from 'crypto-js'
import _pbkdf2 from 'pbkdf2'

const PBKDF2_ITERATIONS = 1000000
const PBKDF2_LENGTH = 32
const PBKDF2_DIGEST = 'sha256'

async function pbkdf2 (password, salt) {
  return new Promise((resolve, reject) => {
    _pbkdf2.pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_LENGTH, PBKDF2_DIGEST, (err, derivedKey) => {
      if (err) reject(err)
      else resolve(Buffer.from(derivedKey).toString('hex'))
    })
  })
}

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

async function encrypt (value, key) {
  const keySalt = Enc.Hex.stringify(Lib.WordArray.random(16))
  const derivedKey = await pbkdf2(key, keySalt)
  const rawEncryptedValue = AES.encrypt(value, derivedKey)
  return {
    encrypted: JsonFormatter.stringify(rawEncryptedValue),
    keySalt
  }
}

async function decrypt (encrypted, key, keySalt) {
  if (!keySalt) return false

  const encryptedValue = JsonFormatter.parse(encrypted)
  try {
    const derivedKey = await pbkdf2(key, keySalt)
    const decryptedValue = AES.decrypt(encryptedValue, derivedKey)
    return decryptedValue.toString(Enc.Utf8)
  } catch (e) {
    return false
  }
}

// TODO: to be removed
async function decryptLegacy (value, key) {
  try {
    const encryptedValue = JsonFormatter.parse(value)
    const decryptedValue = AES.decrypt(encryptedValue, key)

    return decryptedValue.toString(Enc.Utf8)
  } catch (e) {
    return false
  }
}

export {
  encrypt,
  decrypt,
  decryptLegacy
}
