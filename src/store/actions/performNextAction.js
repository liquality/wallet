import { random } from 'lodash-es'
import { sha256 } from '@liquality/crypto'
import { INTERVALS, TIMEOUTS, timestamp, unlockAsset, updateOrder } from '../utils'
import { createSwapNotification } from '../../broker/notification'

export const performNextAction = async ({ commit, getters, dispatch }, { network, walletId, id }) => {
  const order = getters.historyItemById(network, walletId, id)
  if (!order) return
  if (!order.status) return

  const fromClient = getters.client(network, walletId, order.from)
  const toClient = getters.client(network, walletId, order.to)

  if (order.status === 'QUOTE') {
    let [fromAddress, toAddress] = await dispatch('getUnusedAddresses', { network, walletId, assets: [order.from, order.to] })

    fromAddress = fromAddress.toString()
    toAddress = toAddress.toString()

    const message = [
      'Creating a swap with following terms:',
      `Send: ${order.fromAmount} (lowest denomination) ${order.from}`,
      `Receive: ${order.toAmount} (lowest denomination) ${order.to}`,
      `My ${order.from} Address: ${fromAddress}`,
      `My ${order.to} Address: ${toAddress}`,
      `Counterparty ${order.from} Address: ${order.fromCounterPartyAddress}`,
      `Counterparty ${order.to} Address: ${order.toCounterPartyAddress}`,
      `Timestamp: ${Date.now()}`
    ].join('\n')

    const messageHex = Buffer.from(message, 'utf8').toString('hex')
    const secret = await fromClient.swap.generateSecret(messageHex)
    const secretHash = sha256(secret)

    const updates = {
      secret,
      fromAddress,
      toAddress,
      secretHash,
      status: 'SECRET_READY'
    }

    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id,
      updates
    })

    createSwapNotification({
      ...order,
      ...updates
    })

    dispatch('performNextAction', { network, walletId, id })
  } else if (order.status === 'SECRET_READY') {
    if (await dispatch('checkIfQuoteExpired', { network, walletId, order })) return

    const lock = await dispatch('getLockForAsset', { network, walletId, asset: order.from, order })

    let fromFundHash

    try {
      fromFundHash = await fromClient.swap.initiateSwap(
        order.fromAmount,
        order.fromCounterPartyAddress,
        order.fromAddress,
        order.secretHash,
        order.swapExpiration,
        order.fee
      )
    } catch (e) {
      commit('UPDATE_HISTORY', {
        network,
        walletId,
        id,
        updates: {
          error: e.toString()
        }
      })
      return
    } finally {
      unlockAsset(lock)
    }

    const updates = {
      fromFundHash,
      status: 'INITIATED'
    }

    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id,
      updates
    })

    createSwapNotification({
      ...order,
      ...updates
    })

    dispatch('performNextAction', { network, walletId, id })
  } else if (order.status === 'INITIATED') {
    await updateOrder(order.agent, id, {
      fromAddress: order.fromAddress,
      toAddress: order.toAddress,
      fromFundHash: order.fromFundHash,
      secretHash: order.secretHash
    })

    const updates = {
      status: 'INITIATION_REPORTED'
    }

    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id,
      updates
    })

    createSwapNotification({
      ...order,
      ...updates
    })

    dispatch('performNextAction', { network, walletId, id })
  } else if (['WAITING_FOR_CONFIRMATIONS', 'INITIATION_REPORTED'].includes(order.status)) {
    const interval = setInterval(async () => {
      if (await dispatch('checkIfSwapHasExpired', { network, walletId, order })) {
        clearInterval(interval)

        return dispatch('performNextAction', { network, walletId, id })
      }

      const tx = await toClient.swap.findInitiateSwapTransaction(
        order.toAmount, order.toAddress, order.toCounterPartyAddress, order.secretHash, order.nodeSwapExpiration
      )

      if (tx) {
        const toFundHash = tx.hash
        const isVerified = await toClient.swap.verifyInitiateSwapTransaction(
          toFundHash, order.toAmount, order.toAddress, order.toCounterPartyAddress, order.secretHash, order.nodeSwapExpiration
        )
        if (isVerified && tx.confirmations >= order.minConf) {
          clearInterval(interval)

          const updates = {
            toFundHash,
            status: 'READY_TO_EXCHANGE'
          }

          commit('UPDATE_HISTORY', {
            network,
            walletId,
            id,
            updates
          })

          createSwapNotification({
            ...order,
            ...updates
          })

          dispatch('performNextAction', { network, walletId, id })
        } else if (order.status === 'INITIATION_REPORTED') {
          const updates = {
            toFundHash,
            status: 'WAITING_FOR_CONFIRMATIONS'
          }

          commit('UPDATE_HISTORY', {
            network,
            walletId,
            id,
            updates
          })

          createSwapNotification({
            ...order,
            ...updates
          })
        }
      }
    }, random(15000, 30000))

    INTERVALS.push(interval)
  } else if (['READY_TO_EXCHANGE'].includes(order.status)) {
    const lock = await dispatch('getLockForAsset', { network, walletId, asset: order.to, order })

    let toClaimHash

    try {
      toClaimHash = await toClient.swap.claimSwap(
        order.toFundHash,
        order.toAddress,
        order.toCounterPartyAddress,
        order.secret,
        order.nodeSwapExpiration,
        order.claimFee
      )
    } catch (e) {
      commit('UPDATE_HISTORY', {
        network,
        walletId,
        id,
        updates: {
          error: e.toString()
        }
      })
      return
    } finally {
      unlockAsset(lock)
    }

    if (order.sendTo) {
      const updates = {
        toClaimHash,
        status: 'READY_TO_SEND'
      }

      commit('UPDATE_HISTORY', {
        network,
        walletId,
        id,
        updates
      })

      createSwapNotification({
        ...order,
        ...updates
      })

      dispatch('performNextAction', { network, walletId, id })
    } else {
      const updates = {
        toClaimHash,
        endTime: Date.now(),
        status: 'SUCCESS'
      }

      commit('UPDATE_HISTORY', {
        network,
        walletId,
        id,
        updates
      })

      createSwapNotification({
        ...order,
        ...updates
      })

      dispatch('updateBalances', { network, walletId, assets: [order.to, order.from] })
    }
  } else if (order.status === 'GET_REFUND') {
    const diff = ((order.swapExpiration - timestamp()) + random(5, 10)) * 1000

    const refund = async () => {
      const lock = await dispatch('getLockForAsset', { network, walletId, asset: order.from, order })

      let refundHash

      try {
        refundHash = await fromClient.swap.refundSwap(
          order.fromFundHash,
          order.fromCounterPartyAddress,
          order.fromAddress,
          order.secretHash,
          order.swapExpiration,
          order.fee
        )
      } catch (e) {
        commit('UPDATE_HISTORY', {
          network,
          walletId,
          id,
          updates: {
            error: e.toString()
          }
        })
        return
      } finally {
        unlockAsset(lock)
      }

      const updates = {
        refundHash,
        endTime: Date.now(),
        status: 'REFUNDED'
      }

      commit('UPDATE_HISTORY', {
        network,
        walletId,
        id,
        updates
      })

      createSwapNotification({
        ...order,
        ...updates
      })

      dispatch('updateBalances', { network, walletId, assets: [order.to, order.from] })
    }

    if (diff > 0) {
      TIMEOUTS.push(setTimeout(refund, diff))
    } else {
      await refund()
    }
  } else if (order.status === 'READY_TO_SEND') {
    const lock = await dispatch('getLockForAsset', { network, walletId, asset: order.to, order })

    let sendToHash

    try {
      sendToHash = await toClient.chain.sendTransaction(order.sendTo, order.toAmount)
    } catch (e) {
      commit('UPDATE_HISTORY', {
        network,
        walletId,
        id,
        updates: {
          error: e.toString()
        }
      })
      return
    } finally {
      unlockAsset(lock)
    }

    const updates = {
      sendToHash,
      endTime: Date.now(),
      status: 'SUCCESS'
    }

    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id,
      updates
    })

    createSwapNotification({
      ...order,
      ...updates
    })

    dispatch('updateBalances', { network, walletId, assets: [order.to, order.from] })
  }
}
