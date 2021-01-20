import EventEmitter from 'events'
import { BG_PREFIX, connectToBackground, newConnectId } from './utils'

class Foreground {
  constructor (store) {
    this.store = store
    this.name = newConnectId()
    this.connection = null
    this.initialized = false
    this.pendingMutations = []
    this.emitter = new EventEmitter()

    this.bindMutation()
    this.bindActions()

    this.connection = connectToBackground(this.name)
    this.connection.onMessage.addListener(message => this.onMessage(message))

    this.store.subscribe(mutation => {
      // do not emit mutations starting with BG_PREFIX
      // and UI shoulnd't access mutations with BG_PREFIX
      if (mutation.type.startsWith(BG_PREFIX)) return

      if (!this.initialized) {
        // wait for REHYDRATE_STATE
        this.pendingMutations.push(mutation)
        return
      }

      // send mutation to the Background
      this.sendMutation({ ...mutation, type: this.name + mutation.type })
    })
  }

  bindMutation () {
    const { _mutations: mutations } = this.store

    // copy mutations to BG_PREFIX namespace
    Object.entries(mutations).forEach(([type, funcList]) => {
      mutations[BG_PREFIX + type] = funcList
    })
  }

  bindActions () {
    const { _actions: actions } = this.store

    // overwrite actions with proxy
    // all actions are performed in Background
    // and result is sent back to Foreground
    Object.entries(actions).forEach(([type, funcList]) => {
      actions[type] = [this.prepareAction(type)]
    })
  }

  onMessage ({ id, type, data }) {
    switch (type) {
      case 'ACTION_RESPONSE':
        this.emitter.emit(id, data)
        break

      case 'REHYDRATE_STATE':
        if (this.initialized) throw new Error('State has already been synchronised with Background')

        this.store.replaceState(data)

        this.initialized = true

        this.processPendingMutations()
        break

      case 'MUTATION':
        // Don't commit any mutation from other contexts before REHYDRATE_STATE
        if (!this.initialized) return

        this.store.commit(data.type, data.payload)
        break

      default:
        throw new Error(`Received an invalid message type: ${type}`)
    }
  }

  prepareAction (type) {
    return payload => new Promise((resolve, reject) => {
      const id = Date.now() + '.' + Math.random()

      // wait for the result
      this.emitter.once(id, result => {
        if (result.error) reject(new Error(result.error))
        else resolve(result.result)
      })

      this.connection.postMessage({
        id,
        type: 'ACTION_REQUEST',
        data: { type, payload }
      })
    })
  }

  sendMutation (mutation) {
    this.connection.postMessage({
      type: 'MUTATION',
      data: mutation
    })
  }

  processPendingMutations () {
    this.pendingMutations = this.pendingMutations.filter(mutation => {
      this.store.commit(mutation.type, mutation.payload)
      return false
    })
  }
}

export default Foreground
