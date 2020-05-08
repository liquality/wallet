import { enc as Enc, AES, lib as Lib } from 'crypto-js'

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

const encrypt = (value, key) => {
  const rawEncryptedValue = AES.encrypt(value, key)
  return JsonFormatter.stringify(rawEncryptedValue)
}

const decrypt = (value, key) => {
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
  decrypt
}
