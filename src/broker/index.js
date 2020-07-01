import VuexPersist from 'vuex-persist'
import { omit } from 'lodash-es'

import Background from './Background'
import Foreground from './Foreground'
import { isBackgroundScript } from './utils'
import Storage from './Storage'

const Broker = state => {
  if (isBackgroundScript(window)) {
    const vuexPersist = new VuexPersist({
      key: 'liquality-wallet-dev-14',
      storage: Storage,
      asyncStorage: true,
      reducer: s => omit(s, ['key', 'wallets', 'unlockedAt']) // do not persist these states
    })

    return {
      plugin: store => {
        vuexPersist.plugin(store)
        return new Background(store)
      },
      state
    }
  }

  return {
    plugin: store => new Foreground(store),
    state: {}
  }
}

export default Broker
