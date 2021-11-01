import { TerraNetworks } from '@liquality/terra-networks'

import PortStream from 'extension-port-stream'
import BN from 'bignumber.js'

import { emitter } from '../store/utils'

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

const getTransactionParams = (payload) => {
  const { fee, gasAdjustment, msgs } = payload
  const msg = JSON.parse(msgs[0]).value || JSON.parse(msgs[0])
  const { amount, gas, gas_limit: gasLimit } = JSON.parse(fee)

  const value = msg.coins?.[0]?.amount || msg.amount?.[0]?.amount || msg.execute_msg?.transfer?.amount || msg.execute_msg?.send?.amount || 0
  const denom = msg.coins?.[0]?.denom || msg.amount?.[0]?.denom
  const to = msg.to_address || msg.execute_msg?.send?.contract || msg.execute_msg?.transfer?.recipient || msg.contract
  const contractAddress = msg.contract

  const method = getExecutedMethod(msgs)
  const _fee = new BN(amount[0].amount).div(new BN(gas || gasLimit)).toString()

  const asset = !value ? 'uusd' : denom || contractAddress || 'luna'

  return {
    asset,
    to,
    method,
    fee: _fee,
    gasAdjustment: gasAdjustment
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
        const { to, gasAdjustment, fee, asset, method } = getTransactionParams(payload)

        const args = [{
          to,
          fee,
          asset,
          method,
          data: payload,
          gas: gasAdjustment
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

    const { externalConnections, activeWalletId } = store.state

    const allowed = Object.keys(externalConnections[activeWalletId] || {}).includes(origin) &&
    Object.keys(externalConnections[activeWalletId]?.[origin] || {}).includes('terra')

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
        emitter.$once(`origin:${origin}`, (allowed, accountId, chain) => {
          const accountData = store.getters.accountItem(accountId)
          const [address] = accountData.addresses

          sendResponse('onConnect', { address })
        })

        if (allowed) {
          const accountData = store.getters.accountsData.filter(e => e.chain === 'terra')[0]

          if (!accountData?.addresses?.length) {
            store.dispatch('requestOriginAccess', { origin, chain: 'terra' })
          } else {
            const [address] = accountData.addresses
            sendResponse('onConnect', { address })
          }
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
