import VuexPersist from 'vuex-persist'
import { omit } from 'lodash-es'

import Background from './Background'
import Foreground from './Foreground'
import { isBackgroundScript } from './utils'
import Storage from './Storage'

const Broker = state => {
  if (isBackgroundScript(window)) {
    const vuexPersist = new VuexPersist({
      key: 'liquality-wallet',
      storage: Storage,
      asyncStorage: true,
      reducer: s => omit(s, ['key', 'wallets', 'unlockedAt']) // do not persist these states
    })

    /**
     * Hook into vuex-persist `restoreState` such that a migration of the old localstorage state
     * happens before the plugin starts restoring the state from chrome storage.
     */
    const prevStorage = window.localStorage.getItem('liquality-wallet-dev-14')
    if (prevStorage) {
      const restoreState = vuexPersist.restoreState
      vuexPersist.restoreState = async (key, storage) => {
        await Storage.setItem('liquality-wallet', JSON.parse(prevStorage))
        const state = await restoreState(key, storage)
        window.localStorage.removeItem('liquality-wallet-dev-14')
        vuexPersist.restoreState = restoreState // Remove hook
        return state
      }
    }

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
