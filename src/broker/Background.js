import { BG_PREFIX, handleConnection, removeConnectId, getAppId } from './utils'

class Background {
  constructor (store) {
    this.store = store
    this.connections = []

    this.store.subscribe(mutation => {
      this.connections.forEach(connection => {
        let { type } = mutation

        if (type.startsWith(connection.name)) return

        type = removeConnectId(type)

        this.sendMutation(connection, { ...mutation, type: BG_PREFIX + type })
      })
    })

    handleConnection(connection => this.onConnection(connection))
  }

  onConnection (connection) {
    connection.onMessage.addListener(message => this.onMessage(connection, message))

    const isExtension = connection.sender.url.startsWith(`chrome-extension://${getAppId()}/`)
    if (!isExtension) return

    connection.onDisconnect.addListener(() => {
      this.onDisconnect(connection)
      this.unbindMutation(connection)
    })

    this.bindMutation(connection)

    this.connections.push(connection)

    connection.postMessage({
      type: 'REHYDRATE_STATE',
      data: this.store.state
    })
  }

  bindMutation (connection) {
    const { name } = connection
    const { _mutations: mutations } = this.store

    Object.entries(mutations).forEach(([type, funcList]) => {
      const isProxyMutation = this.connections.some(conn => type.startsWith(conn.name))

      if (!isProxyMutation) {
        mutations[name + type] = funcList
      }
    })
  }

  unbindMutation (connection) {
    const { name } = connection
    const { _mutations: mutations } = this.store

    Object.entries(mutations).forEach(([type, funcList]) => {
      if (type.startsWith(name)) {
        delete mutations[type]
      }
    })
  }

  onDisconnect (connection) {
    const index = this.connections.findIndex(conn => conn.name === connection.name)
    if (index !== -1) this.connections.splice(index, 1)
  }

  onMessage (connection, { id, type, data }) {
    console.log('onMessage', { id, type, data })

    switch (type) {
      case 'ACTION_REQUEST':
        this.store.dispatch(data.type, data.payload)
          .then(result => ({ result }))
          .catch(error => {
            console.error(error) /* eslint-disable-line */
            return { error: error.toString() }
          })
          .then(response => {
            connection.postMessage({
              id,
              type: 'ACTION_RESPONSE',
              data: response
            })
          })
        break

      case 'CAL_REQUEST':
        this.store.dispatch('injectedProvider', data.payload)
          .then(result => ({ result }))
          .catch(error => {
            console.error(error) /* eslint-disable-line */
            return { error: error.toString() }
          })
          .then(response => {
            connection.postMessage({
              id,
              type: 'CAL_RESPONSE',
              data: response
            })
          })
        break

      case 'MUTATION':
        this.store.commit(data.type, data.payload)
        break

      default:
        throw new Error(`Received an invalid message type: ${type}`)
    }
  }

  sendMutation (connection, mutation) {
    connection.postMessage({
      type: 'MUTATION',
      data: mutation
    })
  }
}

export default Background
