import { random } from 'lodash-es'
import { sha256 } from '@liquality/crypto'
import { unlockAsset, updateOrder } from '../utils'
import { createSwapNotification } from '../../broker/notification'

async function withLock ({ dispatch }, { asset, order, network, walletId }, func) {
  const lock = await dispatch('getLockForAsset', { network, walletId, asset, order })
  try {
    return await func()
  } catch (e) {
    return { error: e.toString() }
  } finally {
    unlockAsset(lock)
  }
}

async function withInterval (func) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const updates = await func()
      if (updates) {
        clearInterval(interval)
        resolve(updates)
      }
    }, random(15000, 30000))
  })
}

async function hasSwapExpired ({ getters }, { network, walletId, order }) {
  const fromClient = getters.client(network, walletId, order.from)
  const latestBlock = await fromClient.chain.getBlockByNumber(await fromClient.chain.getBlockHeight())
  return latestBlock.timestamp > order.swapExpiration
}

async function createSecret ({ getters, dispatch }, { order, network, walletId }) {
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
    `Timestamp: ${order.swapExpiration}`
  ].join('\n')

  const messageHex = Buffer.from(message, 'utf8').toString('hex')
  const fromClient = getters.client(network, walletId, order.from)
  const secret = await fromClient.swap.generateSecret(messageHex)
  const secretHash = sha256(secret)

  return {
    secret,
    fromAddress,
    toAddress,
    secretHash,
    status: 'SECRET_READY'
  }
}

async function initiateSwap ({ getters, dispatch }, { order, network, walletId }) {
  if (await dispatch('checkIfQuoteExpired', { network, walletId, order })) return

  const fromClient = getters.client(network, walletId, order.from)

  const fromFundHash = await fromClient.swap.initiateSwap(
    order.fromAmount,
    order.fromCounterPartyAddress,
    order.fromAddress,
    order.secretHash,
    order.swapExpiration,
    order.fee
  )

  return {
    fromFundHash,
    status: 'INITIATED'
  }
}

async function reportInitiation (store, { order }) {
  await updateOrder(order.agent, order.id, {
    fromAddress: order.fromAddress,
    toAddress: order.toAddress,
    fromFundHash: order.fromFundHash,
    secretHash: order.secretHash
  })

  return {
    status: 'INITIATION_REPORTED'
  }
}

async function findInitiation ({ getters }, { order, network, walletId }) {
  if (await hasSwapExpired({ getters }, { order, network, walletId })) {
    return { status: 'GET_REFUND' }
  }

  const toClient = getters.client(network, walletId, order.to)

  const tx = await toClient.swap.findInitiateSwapTransaction(
    order.toAmount, order.toAddress, order.toCounterPartyAddress, order.secretHash, order.nodeSwapExpiration
  )

  if (tx) {
    const toFundHash = tx.hash
    const isVerified = await toClient.swap.verifyInitiateSwapTransaction(
      toFundHash, order.toAmount, order.toAddress, order.toCounterPartyAddress, order.secretHash, order.nodeSwapExpiration
    )
    if (isVerified) {
      return {
        toFundHash,
        status: 'WAITING_FOR_CONFIRMATIONS'
      }
    }
  }
}

async function waitForConfirmations ({ getters }, { order, network, walletId }) {
  if (await hasSwapExpired({ getters }, { order, network, walletId })) {
    return { status: 'GET_REFUND' }
  }

  const toClient = getters.client(network, walletId, order.to)

  const tx = await toClient.chain.getTransactionByHash(order.toFundHash)

  if (tx && tx.confirmations >= order.minConf) {
    return {
      status: 'READY_TO_CLAIM'
    }
  }
}

async function claimSwap ({ getters }, { order, network, walletId }) {
  if (await hasSwapExpired({ getters }, { order, network, walletId })) {
    return { status: 'GET_REFUND' }
  }

  const toClient = getters.client(network, walletId, order.to)

  const toClaimHash = await toClient.swap.claimSwap(
    order.toFundHash,
    order.toAddress,
    order.toCounterPartyAddress,
    order.secret,
    order.nodeSwapExpiration,
    order.claimFee
  )

  return {
    toClaimHash,
    status: 'WAITING_FOR_CLAIM_CONFIRMATIONS'
  }
}

async function waitForClaimConfirmations ({ getters, dispatch }, { order, network, walletId }) {
  if (await hasSwapExpired({ getters }, { order, network, walletId })) {
    return { status: 'GET_REFUND' }
  }

  const toClient = getters.client(network, walletId, order.to)

  const tx = await toClient.chain.getTransactionByHash(order.toClaimHash)

  if (tx && tx.confirmations > 0) {
    if (order.sendTo) {
      return {
        status: 'READY_TO_SEND'
      }
    } else {
      dispatch('updateBalances', { network, walletId, assets: [order.to, order.from] })

      return {
        endTime: Date.now(),
        status: 'SUCCESS'
      }
    }
  }
}

async function waitForRefundConfirmations ({ getters }, { order, network, walletId }) {
  const fromClient = getters.client(network, walletId, order.from)
  const tx = await fromClient.chain.getTransactionByHash(order.refundHash)

  if (tx && tx.confirmations > 0) {
    return {
      endTime: Date.now(),
      status: 'REFUNDED'
    }
  }
}

async function refundSwap ({ getters }, { order, network, walletId }) {
  const fromClient = getters.client(network, walletId, order.from)
  const refundHash = await fromClient.swap.refundSwap(
    order.fromFundHash,
    order.fromCounterPartyAddress,
    order.fromAddress,
    order.secretHash,
    order.swapExpiration,
    order.fee
  )

  return {
    refundHash,
    status: 'WAITING_FOR_REFUND_CONFIRMATIONS'
  }
}

async function sendTo ({ getters, dispatch }, { order, network, walletId }) {
  const toClient = getters.client(network, walletId, order.to)
  const sendToHash = await toClient.chain.sendTransaction(order.sendTo, order.toAmount)

  dispatch('updateBalances', { network, walletId, assets: [order.to, order.from] })

  return {
    sendToHash,
    endTime: Date.now(),
    status: 'SUCCESS'
  }
}

export const performNextAction = async (store, { network, walletId, id }) => {
  const { dispatch, commit, getters } = store
  const order = getters.historyItemById(network, walletId, id)
  if (!order) return
  if (!order.status) return

  let updates

  switch (order.status) {
    case 'QUOTE':
      updates = await createSecret(store, { order, network, walletId })
      break

    case 'SECRET_READY':
      updates = await withLock(store, { asset: order.from, order, network, walletId },
        async () => initiateSwap(store, { order, network, walletId }))
      break

    case 'INITIATED':
      updates = await reportInitiation(store, { order, network, walletId })
      break

    case 'INITIATION_REPORTED':
      updates = await withInterval(async () => findInitiation(store, { order, network, walletId }))
      break

    case 'WAITING_FOR_CONFIRMATIONS':
      updates = await withInterval(async () => waitForConfirmations(store, { order, network, walletId }))
      break

    case 'READY_TO_CLAIM':
      updates = await withLock(store, { asset: order.to, order, network, walletId },
        async () => claimSwap(store, { order, network, walletId }))
      break

    case 'WAITING_FOR_CLAIM_CONFIRMATIONS':
      updates = await withInterval(async () => waitForClaimConfirmations(store, { order, network, walletId }))
      break

    case 'GET_REFUND':
      updates = await withLock(store, { asset: order.from, order, network, walletId },
        async () => refundSwap(store, { order, network, walletId }))
      break

    case 'WAITING_FOR_REFUND_CONFIRMATIONS':
      updates = await withInterval(async () => waitForRefundConfirmations(store, { order, network, walletId }))
      break

    case 'READY_TO_SEND':
      updates = await withLock(store, { asset: order.to, order, network, walletId },
        async () => sendTo(store, { order, network, walletId }))
      break
  }

  if (updates) {
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

    if (!updates.error) {
      dispatch('performNextAction', { network, walletId, id })
    }
  }
}
