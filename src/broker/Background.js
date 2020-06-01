import { BG_PREFIX, handleConnection, removeConnectId, getAppId } from './utils'

class Background {
  constructor (store) {
    this.store = store
    this.internalConnections = []
    this.externalConnectionApprovalMap = {}

    this.subscribeToMutations()

    handleConnection(connection => {
      const isInternal = connection.sender.origin === `chrome-extension://${getAppId()}`

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

    connection.postMessage({
      type: 'REHYDRATE_STATE',
      data: this.store.state
    })
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
    console.log('onInternalMessage', { id, type, data })

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
    console.log('onExternalMessage', { id, type, data })

    const { origin } = connection.sender
    const entry = this.externalConnectionApprovalMap[origin]

    switch (type) {
      case 'ENABLE_REQUEST':
        if (entry === false) {
          connection.postMessage({
            id,
            data: {
              error: 'User denied'
            }
          })
          return
        } else if (entry === true) {
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
        if (entry !== true) {
          connection.postMessage({
            id,
            data: {
              error: 'Use enable() method first'
            }
          })
          return
        }

        this.storeProxy(id, connection, 'injectedProvider', data)
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
        if (action === 'requestOriginAccess') {
          this.externalConnectionApprovalMap[data.origin] = response.result === true
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
