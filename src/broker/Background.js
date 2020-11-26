import { BG_PREFIX, handleConnection, removeConnectId, getRootURL } from './utils'

class Background {
  constructor (store) {
    this.store = store
    this.internalConnections = []
    this.externalConnectionApprovalMap = {}

    this.subscribeToMutations()

    handleConnection(connection => {
      const { url } = connection.sender
      const isInternal = url.startsWith(getRootURL())

      if (isInternal) {
        this.onInternalConnection(connection)
      } else {
        this.onExternalConnection(connection)
      }
    })
  }

  subscribeToMutations () {
    this.store.subscribe(mutation => {
      this.internalConnections.forEach(connection => {
        let { type } = mutation

        if (type.startsWith(connection.name)) return

        type = removeConnectId(type)

        this.sendMutation(connection, { ...mutation, type: BG_PREFIX + type })
      })
    })
  }

  onInternalConnection (connection) {
    this.internalConnections.push(connection)

    connection.onMessage.addListener(message => this.onInternalMessage(connection, message))

    connection.onDisconnect.addListener(() => {
      this.onInternalDisconnect(connection)
      this.unbindMutation(connection)
    })

    this.bindMutation(connection)

    this.store.restored.then(() => connection.postMessage({
      type: 'REHYDRATE_STATE',
      data: this.store.state
    }))
  }

  onExternalConnection (connection) {
    connection.onMessage.addListener(message => this.onExternalMessage(connection, message))
  }

  bindMutation (connection) {
    const { name } = connection
    const { _mutations: mutations } = this.store

    Object.entries(mutations).forEach(([type, funcList]) => {
      const isProxyMutation = this.internalConnections.some(conn => type.startsWith(conn.name))

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

  onInternalDisconnect (connection) {
    const index = this.internalConnections.findIndex(conn => conn.name === connection.name)
    if (index !== -1) this.internalConnections.splice(index, 1)
  }

  onInternalMessage (connection, { id, type, data }) {
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

      case 'MUTATION':
        this.store.commit(data.type, data.payload)
        break

      default:
        throw new Error(`Received an invalid message type: ${type}`)
    }
  }

  onExternalMessage (connection, { id, type, data }) {
    const { url } = connection.sender
    const { origin } = new URL(url)

    const allowed = this.externalConnectionApprovalMap[origin]

    switch (type) {
      case 'ENABLE_REQUEST':
        if (allowed) {
          connection.postMessage({
            id,
            data: {
              result: true
            }
          })
          return
        }

        this.storeProxy(id, connection, 'requestOriginAccess', { origin })
        break

      case 'CAL_REQUEST':
        if (!allowed) {
          connection.postMessage({
            id,
            data: {
              error: 'Use enable() method first'
            }
          })
          return
        }

        this.storeProxy(id, connection, 'requestPermission', { origin, data })
        break
    }
  }

  storeProxy (id, connection, action, data) {
    this.store.dispatch(action, data)
      .then(result => ({ result }))
      .catch(error => {
        console.error(error) /* eslint-disable-line */
        return { error: error.toString() }
      })
      .then(response => {
        if (action === 'requestOriginAccess' && response.result) {
          this.externalConnectionApprovalMap[data.origin] = true
        }

        connection.postMessage({
          id,
          data: response
        })
      })
  }

  sendMutation (connection, mutation) {
    connection.postMessage({
      type: 'MUTATION',
      data: mutation
    })
  }
}

export default Background
