import PortStream from 'extension-port-stream'

import { emitter } from '../store/utils'

let isConnected = false
let _address

export const connectRemote = (remotePort, store) => {
  if (remotePort.name !== 'TerraStationExtension') {
    return
  }

  const origin = remotePort.sender.origin

  const portStream = new PortStream(remotePort)

  const sendResponse = (name, payload) => {
    portStream.write({ name, payload })
  }

  portStream.on('data', (data) => {
    // console.log('Station(background): portStream.on', data)
    const { type, ...payload } = data

    /* handle sign & post */
    const handleRequest = (key) => {
      if (key === 'post') {
        const { fee, gasAdjustment, msgs } = payload;
        const { value: { contract, coins } } = JSON.parse(msgs)

        const args = [{
          to: contract,
          value: coins[0].amount,
          data: payload,
          gas: gasAdjustment,
          fee
        }]

        const id = Date.now() + '.' + Math.random()

        emitter.$once(`permission:${id}`, (response) => {
          console.log('here?')
          if (!response.allowed) reject(new Error('User denied'))
          if (response.error) reject(new Error(response.error))
          console.log('RESPONSE', response)
          sendResponse('onPost', { success: true })
        })

        store.dispatch('requestPermission', { origin, data: { args, method: 'chain.sendTransaction', asset: 'ULUNA' } })

      } else {
        // handle sign
      }
    }

    switch (type) {
      case 'info':
        sendResponse('onInfo', {
          chainID: "bombay-10",
          fcd: "https://bombay-fcd.terra.dev/v1",
          lcd: "https://bombay-lcd.terra.dev",
          localterra: false,
          name: "bombay"
        })

        break

      case 'connect':
        if (!isConnected) {
          emitter.$once(`origin:${origin}`, (allowed, accountId, chain) => {
            isConnected = true

            const accountData = store.getters.accountItem(accountId)
            const [address] = accountData.addresses

            _address = address

            sendResponse('onConnect', { address })
          });

          store.dispatch('requestOriginAccess', { origin, chain: 'terra' })
        }

        if (_address) {
          sendResponse('onConnect', { address: _address })
        }

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