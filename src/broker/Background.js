import { ChainNetworks } from '@liquality/wallet-core/dist/src/utils/networks'
import { buildConfig } from '@liquality/wallet-core'
import { BG_PREFIX, handleConnection, removeConnectId, getRootURL } from './utils'
import { getAsset } from '@liquality/cryptoassets'
import { connectRemote } from './terra-injection'

function attemptOrWarn(func, message) {
  try {
    func()
  } catch (e) {
    console.warn(message, e)
  }
}

class Background {
  constructor(store) {
    this.store = store
    this.internalConnections = []
    this.externalConnections = []

    this.subscribeToMutations()
    this.subscribeToWalletChanges()

    handleConnection((connection) => {
      const { url } = connection.sender
      const isInternal = url.startsWith(getRootURL())

      if (connection.name === 'TerraStationExtension') {
        connectRemote(connection, store)
      } else if (isInternal) {
        this.onInternalConnection(connection)
      } else {
        if (connection.name !== 'HW-BRIDGE') {
          this.onExternalConnection(connection)
        }
      }
    })
  }

  subscribeToMutations() {
    this.store.subscribe((mutation) => {
      this.internalConnections.forEach((connection) => {
        let { type } = mutation

        if (type.startsWith(connection.name)) return

        type = removeConnectId(type)

        this.sendMutation(connection, { ...mutation, type: BG_PREFIX + type })
      })
    })
  }

  getChainIds(network) {
    return buildConfig.chains.reduce((chainIds, chain) => {
      return Object.assign({}, chainIds, {
        [chain]: ChainNetworks[chain][network].chainId
      })
    }, {})
  }

  subscribeToWalletChanges() {
    this.store.subscribe((mutation, state) => {
      if (mutation.type === 'CHANGE_ACTIVE_NETWORK') {
        this.externalConnections.forEach((connection) =>
          attemptOrWarn(
            () =>
              connection.postMessage({
                id: 'liqualityChainChanged',
                data: { chainIds: this.getChainIds(state.activeNetwork) }
              }),
            `liqualityChainChanged: Injection connection dropped: ${connection.name}`
          )
        )
      }

      if (mutation.type === 'ADD_EXTERNAL_CONNECTION') {
        this.externalConnections.forEach((connection) =>
          attemptOrWarn(
            () =>
              connection.postMessage({
                id: 'liqualityAccountsChanged',
                data: {}
              }),
            `liqualityAccountsChanged: Injection connection dropped: ${connection.name}`
          )
        )
      }
    })
  }

  onInternalConnection(connection) {
    this.internalConnections.push(connection)

    connection.onMessage.addListener((message) => this.onInternalMessage(connection, message))

    connection.onDisconnect.addListener(() => {
      this.onInternalDisconnect(connection)
      this.unbindMutation(connection)
    })

    this.bindMutation(connection)

    this.store.restored.then(() => {
      connection.postMessage({
        type: 'REHYDRATE_STATE',
        data: this.store.state
      })
    })
  }

  onExternalConnection(connection) {
    this.externalConnections.push(connection)

    connection.onMessage.addListener((message) => this.onExternalMessage(connection, message))

    connection.onDisconnect.addListener(() => {
      this.onExternalDisconnect(connection)
    })
  }

  bindMutation(connection) {
    const { name } = connection
    const { _mutations: mutations } = this.store

    Object.entries(mutations).forEach(([type, funcList]) => {
      const isProxyMutation = this.internalConnections.some((conn) => type.startsWith(conn.name))

      if (!isProxyMutation) {
        mutations[name + type] = funcList
      }
    })
  }

  unbindMutation(connection) {
    const { name } = connection
    const { _mutations: mutations } = this.store

    Object.entries(mutations).forEach(([type]) => {
      if (type.startsWith(name)) {
        delete mutations[type]
      }
    })
  }

  onInternalDisconnect(connection) {
    const index = this.internalConnections.findIndex((conn) => conn.name === connection.name)
    if (index !== -1) this.internalConnections.splice(index, 1)
  }

  onInternalMessage(connection, { id, type, data }) {
    switch (type) {
      case 'ACTION_REQUEST':
        this.store
          .dispatch(data.type, data.payload)
          .then((result) => ({ result }))
          .catch((error) => {
            console.error(error)
            return { error: error.message }
          })
          .then((response) =>
            attemptOrWarn(
              () =>
                connection.postMessage({
                  id,
                  type: 'ACTION_RESPONSE',
                  data: response
                }),
              'Popup was disconnected'
            )
          )
        break

      case 'MUTATION':
        this.store.commit(data.type, data.payload)
        break

      default:
        throw new Error(`Received an invalid message type: ${type}`)
    }
  }

  onExternalMessage(connection, { id, type, data }) {
    const { url } = connection.sender
    const { origin } = new URL(url)
    const { externalConnections, activeWalletId, injectEthereumChain, activeNetwork } =
      this.store.state

    let setDefaultEthereum = false
    let { chain, asset } = data
    if (asset) {
      chain = getAsset(activeNetwork, asset).chain
    }
    if (!chain) {
      const defaultAccountId = (externalConnections[activeWalletId]?.[origin] || {}).defaultEthereum
      if (defaultAccountId) {
        const defaultAccount = this.store.getters.accountItem(defaultAccountId)
        if (defaultAccount) {
          chain = defaultAccount.chain
          setDefaultEthereum = true
        }
      }
    }
    if (!chain) {
      chain = injectEthereumChain
      setDefaultEthereum = true
    }

    const allowed =
      Object.keys(externalConnections[activeWalletId] || {}).includes(origin) &&
      Object.keys(externalConnections[activeWalletId]?.[origin] || {}).includes(chain)

    // Add `accountId` into the request if allowed
    if (allowed) {
      const accountList = { ...externalConnections }[activeWalletId]?.[origin]?.[chain] || []
      const [accountId] = accountList
      data = { ...data, accountId }
    }

    switch (type) {
      case 'ENABLE_REQUEST':
        if (allowed) {
          connection.postMessage({
            id,
            data: {
              result: {
                accepted: true,
                chain
              }
            }
          })
          return
        }

        this.storeProxy(id, connection, 'app/requestOriginAccess', {
          origin,
          chain,
          setDefaultEthereum
        })
        break

      case 'CAL_REQUEST':
        if (allowed || data.method === 'jsonrpc') {
          this.storeProxy(id, connection, 'app/requestPermission', {
            origin,
            data
          })
        } else {
          connection.postMessage({
            id,
            data: {
              error: 'Use enable() method first'
            }
          })
        }
        break

      case 'HANDLE_PAYMENT_URI':
        if (allowed) {
          this.storeProxy(id, connection, 'app/handlePaymentUri', { data })
        } else {
          connection.postMessage({
            id,
            data: {
              error: 'Use enable() method first'
            }
          })
        }
        break
    }
  }

  onExternalDisconnect(connection) {
    const index = this.externalConnections.findIndex((conn) => conn.name === connection.name)
    if (index !== -1) this.externalConnections.splice(index, 1)
  }

  storeProxy(id, connection, action, data) {
    this.store
      .dispatch(action, data)
      .then((result) => ({ result }))
      .catch((error) => {
        console.error(error) /* eslint-disable-line */
        return { error: error.toString() }
      })
      .then((response) => {
        connection.postMessage({
          id,
          data: response
        })
      })
  }

  sendMutation(connection, mutation) {
    connection.postMessage({
      type: 'MUTATION',
      data: mutation
    })
  }
}

export default Background
