import 'setimmediate'
import { random } from 'lodash-es'
import extension from 'extensionizer'
import PortStream from 'extension-port-stream'
import store from './store'
import { wait } from './store/utils'
import { handleConnection } from './broker/utils'


function asyncLoop(fn, delay) {
  return wait(delay())
    .then(() => fn())
    .then(() => asyncLoop(fn, delay))
}

store.subscribe(async ({ type, payload }, state) => {
  switch (type) {
    case 'CHANGE_ACTIVE_NETWORK':
      store.dispatch('initializeAddresses', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateMarketData', { network: state.activeNetwork })
      break

    case 'UNLOCK_WALLET':
      store.dispatch('trackAnalytics', {
        event: 'Wallet Unlock',
        properties: {
          category: 'Unlock Wallet',
          action: 'Unlock Wallet',
          label: 'Unlock Wallet'
        }
      })
      store.dispatch('checkAnalyticsOptIn')
      store.dispatch('initializeAddresses', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateFiatRates')
      store.dispatch('updateMarketData', { network: state.activeNetwork })
      store.dispatch('checkPendingActions', { walletId: state.activeWalletId })

      store.commit('app/SET_USB_BRIDGE_TRANSPORT_CREATED', { created: false })
      store.commit('app/SET_USB_BRIDGE_CREATED', { created: false })

      asyncLoop(
        () => store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId }),
        () => random(400000, 600000)
      )

      asyncLoop(
        () => store.dispatch('updateFiatRates'),
        () => random(400000, 600000)
      )

      asyncLoop(
        () => store.dispatch('updateMarketData', { network: state.activeNetwork }),
        () => random(400000, 600000)
      )

      break
  }
})

const connectRemote = (remotePort) => {
  if (remotePort.name !== 'TerraStationExtension') {
    return
  }

  const origin = remotePort.sender.origin

  console.log('Station(background): connectRemote', remotePort)
  const portStream = new PortStream(remotePort)

  const sendResponse = (name, payload) => {
    console.log(name, payload)
    const writed = portStream.write({ name, payload })
    console.log(writed)
  }

  portStream.on('data', (data) => {
    console.log('Station(background): portStream.on', data)
    const { type, ...payload } = data

    /* handle sign & post */
    const handleRequest = (key) => {
      const handleChange = (changes, namespace) => {
        // Detects changes in storage and returns responses if there are changes.
        // When the request is successful, it also closes the popup.
        if (namespace === 'local') {
          const { oldValue, newValue } = changes[key] || {}

          if (oldValue && newValue) {
            const changed = newValue.find(
              (post, index) =>
                oldValue[index] &&
                typeof oldValue[index].success === 'undefined' &&
                typeof post.success === 'boolean'
            )

            changed &&
              changed.origin === origin &&
              sendResponse('on' + capitalize(key), changed)

            extension.storage.local.get(
              ['sign', 'post'],
              ({ sign = [], post = [] }) => {
                const getRequest = ({ success }) => typeof success !== 'boolean'
                const nextRequest =
                  sign.some(getRequest) || post.some(getRequest)

                !nextRequest && closePopup()
              }
            )
          }
        }
      }

      const handleGet = (storage) => {
        // Check the storage for any duplicate requests already, place them at the end of the storage, and then open a popup.
        // Then it detects changes in storage. (See code above)
        // TODO: Even if the popup is already open, reactivate the popup
        const list = storage[key] || []

        const alreadyRequested =
          list.findIndex(
            (req) => req.id === payload.id && req.origin === origin
          ) !== -1

        !alreadyRequested &&
          extension.storage.local.set({
            [key]: payload.purgeQueue
              ? [{ ...payload, origin }]
              : [...list, { ...payload, origin }],
          })

        openPopup()
        extension.storage.onChanged.addListener(handleChange)
      }

      extension.storage.local.get([key], handleGet)
    }
    console.log('TYPE', type)
    switch (type) {
      case 'info':
        extension.storage.local.get(['network'], ({ network }) => {
          sendResponse('onInfo', network)
        })

        break

      case 'connect':
        const wallet = { address: 'terra1x2hvnrlt4tf6sm0uankwvr809427sx3hvjsq6m' }
        sendResponse('onConnect', wallet)

        break

      case 'sign':
        handleRequest('sign')
        break

      case 'post':
        handleRequest('post')
        break

      default:
        break
    }
  })
}

handleConnection(connectRemote)

