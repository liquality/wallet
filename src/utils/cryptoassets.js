import store from '../store'
import { assets } from '@liquality/cryptoassets'

// Redefine the `cryptoassets` lib to pull from the getter - to include custom tokens
const cryptoassets = new Proxy({}, {
  get (target, name, receiver) {
    return Reflect.get(store.getters.cryptoassets, name, receiver)
  },
  ownKeys () {
    return Reflect.ownKeys({ ...store.getters.cryptoassets, ...assets })
  },
  getOwnPropertyDescriptor (key) {
    return {
      enumerable: true,
      configurable: true
    }
  }
})

export default cryptoassets
