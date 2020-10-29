import { random } from 'lodash-es'
import { sha256 } from '@liquality/crypto'
import { updateOrder, unlockAsset, wait } from '../utils'
import { createSwapNotification } from '../../broker/notification'

async function withLock ({ dispatch }, { order, network, walletId, asset }, func) {
  const lock = await dispatch('getLockForAsset', { order, network, walletId, asset })
  try {
    return await func()
  } catch (e) {
    return { error: e.toString() }
  } finally {
    unlockAsset(lock)
  }
}

async function withInterval (func) {
  const updates = await func()
  if (updates) { return updates }
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

async function hasChainTimePassed ({ getters }, { network, walletId, asset, timestamp }) {
  const client = getters.client(network, walletId, asset)
  const maxTries = 3
  let tries = 0
  while (tries < maxTries) {
    try {
      const blockNumber = await client.chain.getBlockHeight()
      const latestBlock = await client.chain.getBlockByNumber(blockNumber)
      return latestBlock.timestamp > timestamp
    } catch (e) {
      tries++
      if (tries >= maxTries) throw e
      else {
        console.warn(e)
        await wait(2000)
      }
    }
  }
}

async function canRefund ({ getters }, { network, walletId, order }) {
  return hasChainTimePassed({ getters }, { network, walletId, asset: order.from, timestamp: order.swapExpiration })
}

async function hasSwapExpired ({ getters }, { network, walletId, order }) {
  return hasChainTimePassed({ getters }, { network, walletId, asset: order.to, timestamp: order.nodeSwapExpiration })
}

async function handleExpirations ({ getters }, { network, walletId, order }) {
  if (await canRefund({ getters }, { order, network, walletId })) {
    return { status: 'GET_REFUND' }
  }
  if (await hasSwapExpired({ getters }, { order, network, walletId })) {
    return { status: 'WAITING_FOR_REFUND' }
  }
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

  const fromFundTx = await fromClient.swap.initiateSwap(
    order.fromAmount,
    order.fromCounterPartyAddress,
    order.fromAddress,
    order.secretHash,
    order.swapExpiration,
    order.fee
  )

  return {
    fromFundHash: fromFundTx.hash,
    fromFundTx,
    status: 'INITIATED'
  }
}

async function reportInitiation (store, { order }) {
  await updateOrder(order)

  return {
    status: 'INITIATION_REPORTED'
  }
}

async function confirmInitiation ({ getters }, { order, network, walletId }) {
  // Jump the step if counter party has already accepted the initiation
  const counterPartyInitiation = await findCounterPartyInitiation({ getters }, { order, network, walletId })
  if (counterPartyInitiation) return counterPartyInitiation

  const fromClient = getters.client(network, walletId, order.from)

  const tx = await fromClient.chain.getTransactionByHash(order.fromFundHash)

  if (tx && tx.confirmations >= order.minConf) {
    return {
      status: 'INITIATION_CONFIRMED'
    }
  }
}

async function findCounterPartyInitiation ({ getters }, { order, network, walletId }) {
  const expirationUpdates = await handleExpirations({ getters }, { order, network, walletId })
  if (expirationUpdates) { return expirationUpdates }

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
        status: 'CONFIRM_COUNTER_PARTY_INITIATION'
      }
    }
  }
}

async function confirmCounterPartyInitiation ({ getters }, { order, network, walletId }) {
  const expirationUpdates = await handleExpirations({ getters }, { order, network, walletId })
  if (expirationUpdates) { return expirationUpdates }

  const toClient = getters.client(network, walletId, order.to)

  const tx = await toClient.chain.getTransactionByHash(order.toFundHash)

  if (tx && tx.confirmations >= order.minConf) {
    return {
      status: 'READY_TO_CLAIM'
    }
  }
}

async function claimSwap ({ getters }, { order, network, walletId }) {
  const expirationUpdates = await handleExpirations({ getters }, { order, network, walletId })
  if (expirationUpdates) { return expirationUpdates }

  const toClient = getters.client(network, walletId, order.to)

  const toClaimTx = await toClient.swap.claimSwap(
    order.toFundHash,
    order.toAddress,
    order.toCounterPartyAddress,
    order.secret,
    order.nodeSwapExpiration,
    order.claimFee
  )

  return {
    toClaimHash: toClaimTx.hash,
    toClaimTx,
    status: 'WAITING_FOR_CLAIM_CONFIRMATIONS'
  }
}

async function waitForClaimConfirmations ({ getters, dispatch }, { order, network, walletId }) {
  const expirationUpdates = await handleExpirations({ getters }, { order, network, walletId })
  if (expirationUpdates) { return expirationUpdates }

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

async function waitForRefund ({ getters }, { order, network, walletId }) {
  if (await canRefund({ getters }, { order, network, walletId })) {
    return { status: 'GET_REFUND' }
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
  const refundTx = await fromClient.swap.refundSwap(
    order.fromFundHash,
    order.fromCounterPartyAddress,
    order.fromAddress,
    order.secretHash,
    order.swapExpiration,
    order.fee
  )

  return {
    refundHash: refundTx.hash,
    refundTx,
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
      updates = await withLock(store, { order, network, walletId, asset: order.from },
        async () => initiateSwap(store, { order, network, walletId }))
      break

    case 'INITIATED':
      updates = await reportInitiation(store, { order, network, walletId })
      break

    case 'INITIATION_REPORTED':
      updates = await withInterval(async () => confirmInitiation(store, { order, network, walletId }))
      break

    case 'INITIATION_CONFIRMED':
      updates = await withInterval(async () => findCounterPartyInitiation(store, { order, network, walletId }))
      break

    case 'CONFIRM_COUNTER_PARTY_INITIATION':
      updates = await withInterval(async () => confirmCounterPartyInitiation(store, { order, network, walletId }))
      break

    case 'READY_TO_CLAIM':
      updates = await withLock(store, { order, network, walletId, asset: order.to },
        async () => claimSwap(store, { order, network, walletId }))
      break

    case 'WAITING_FOR_CLAIM_CONFIRMATIONS':
      updates = await withInterval(async () => waitForClaimConfirmations(store, { order, network, walletId }))
      break

    case 'WAITING_FOR_REFUND':
      updates = await withInterval(async () => waitForRefund(store, { order, network, walletId }))
      break

    case 'GET_REFUND':
      updates = await withLock(store, { order, network, walletId, asset: order.from },
        async () => refundSwap(store, { order, network, walletId }))
      break

    case 'WAITING_FOR_REFUND_CONFIRMATIONS':
      updates = await withInterval(async () => waitForRefundConfirmations(store, { order, network, walletId }))
      break

    case 'READY_TO_SEND':
      updates = await withLock(store, { order, network, walletId, asset: order.to },
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
