import { TerraNetworks } from '@liquality/terra-networks'

import PortStream from 'extension-port-stream'
import _ from 'lodash'
import BN from 'bignumber.js'

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

const getExecutedMethod = (msgs) => {
  const parsed = msgs.map(msg => JSON.parse(msg))

  const executeMessages = parsed.map(({ type, value }) => {
    if (type === 'wasm/MsgExecuteContract') {
      return value
    }
  })

  if (!executeMessages.filter(Boolean).length) {
    return 'send'
  }

  return Object.keys(executeMessages[executeMessages.length - 1]?.execute_msg)?.[0]
}

const getArgs = (payload) => {
  const { fee, gasAdjustment, msgs } = payload

  const { value } = JSON.parse(msgs[0])
  const { amount, gas } = JSON.parse(fee)

  const _value = getValueForKey(value, 'amount')
  const _to = getValueForKey(value, 'to_address') || getValueForKey(value, 'contract')
  const _denom = getValueForKey(value, 'denom')
  const _contractAddress = value.contract || getValueForKey(value, 'contract')
  const _method = getExecutedMethod(msgs)
  const _fee = new BN(amount[0].amount).div(new BN(gas)).toString()

  return {
    _value,
    _to,
    _denom,
    _contractAddress,
    _method,
    _fee: _fee,
    _gasAdjustment: gasAdjustment
  }
}

export const connectRemote = (remotePort, store) => {
  if (remotePort.name !== 'TerraStationExtension') {
    return
  }

  let config = getConfig(store.state.activeNetwork)

  const origin = remotePort.sender.origin

  const portStream = new PortStream(remotePort)

  const sendResponse = (name, payload) => {
    portStream.write({ name, payload })
  }

  portStream.on('data', (data) => {
    const { type, ...payload } = data

    const handleRequest = async (key) => {
      if (key === 'post') {
        const { _to, _value, _gasAdjustment, _fee, _denom, _contractAddress, _method } = getArgs(payload)

        const args = [{
          to: _to,
          value: _value,
          data: payload,
          gas: _gasAdjustment,
          fee: _fee,
          asset: _denom || _contractAddress,
          method: _method
        }]

        try {
          const response = await store.dispatch('requestPermission', { origin, data: { args, method: 'chain.sendTransaction', asset: 'LUNA', chain: 'terra' } })
          sendResponse('onPost', { ...payload, success: true, result: { txhash: response.hash } })
        } catch (e) {
          sendResponse('onPost', { ...payload, success: false })
        }
      } else {
        // handle sign
      }
    }

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
