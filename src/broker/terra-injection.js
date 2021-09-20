import { TerraNetworks } from '@liquality/terra-networks'

import PortStream from 'extension-port-stream'
import _ from 'lodash'

import { emitter } from '../store/utils'

let isConnected = false
let _address

_.mixin({
  toPairsDeep: obj => _.flatMap(
    _.toPairs(obj),
    ([k, v]) => _.isObjectLike(v) ? _.toPairsDeep(v) : [[k, v]]
  )
})

const getValueForKey = (obj, key) => new Map(_.toPairsDeep(obj)).get(key)

const getConfig = (activeNetwork) => {
  const networkConfig = TerraNetworks['terra_' + activeNetwork]

  const { chainID, nodeUrl: lcd, helperUrl: fcd, name } = networkConfig

  return {
    chainID,
    fcd,
    lcd,
    name: activeNetwork === 'testnet' ? 'bombay' : name,
    localterra: false
  }
}

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
    const { type, ...payload } = data

    const handleRequest = async (key) => {
      if (key === 'post') {
        const { fee, gasAdjustment, msgs } = payload
        const objectData = JSON.parse(msgs[0]).value

        const _value = getValueForKey(objectData, 'amount')
        const _to = getValueForKey(objectData, 'to_address') || getValueForKey(objectData, 'contract')
        // const _denom = getValueForKey(objectData, 'denom')

        const args = [{
          to: _to,
          value: _value,
          data: payload,
          gas: gasAdjustment,
          fee
        }]

        try {
          const response = await store.dispatch('requestPermission', { origin, data: { args, method: 'chain.sendTransaction', asset: 'ULUNA' } })
          sendResponse('onPost', { ...payload, success: true, result: { txhash: response.hash } })
        } catch (e) {
          sendResponse('onPost', { ...payload, success: false })
        }
      } else {
        // handle sign
      }
    }

    let config = getConfig(store.state.activeNetwork)

    switch (type) {
      case 'info':
        store.subscribe((mutation, state) => {
          if (mutation.type === 'CHANGE_ACTIVE_NETWORK') {
            config = getConfig(state.activeNetwork)
          }
        })

        sendResponse('onInfo', config)

        break
      case 'connect':
        if (!isConnected) {
          emitter.$once(`origin:${origin}`, (allowed, accountId, chain) => {
            isConnected = true

            const accountData = store.getters.accountItem(accountId)
            const [address] = accountData.addresses
            _address = address

            sendResponse('onConnect', { address })
          })
        }

        if (_address) {
          sendResponse('onConnect', { address: _address })
        } else {
          store.dispatch('requestOriginAccess', { origin, chain: 'terra' })
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
