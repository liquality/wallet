import { withLock, withInterval, hasChainTimePassed } from './utils'
import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'
import { updateOrder, timestamp } from '../../utils'
import { createNotification } from '../../../broker/notification'
import BN from 'bignumber.js'
import { isERC20 } from '@/utils/asset'

export async function hasQuoteExpired (store, { order }) {
  return timestamp() >= order.expiresAt
}

async function canRefund ({ getters }, { network, walletId, order }) {
  return hasChainTimePassed({ getters }, { network, walletId, asset: order.from, timestamp: order.swapExpiration, fromAccountId: order.fromAccountId })
}

export async function hasSwapExpired ({ getters }, { network, walletId, order }) {
  return hasChainTimePassed({ getters }, { network, walletId, asset: order.to, timestamp: order.nodeSwapExpiration, fromAccountId: order.fromAccountId })
}

async function handleExpirations ({ getters }, { network, walletId, order }) {
  if (await canRefund({ getters }, { order, network, walletId })) {
    return { status: 'GET_REFUND' }
  }
  if (await hasSwapExpired({ getters }, { order, network, walletId })) {
    return { status: 'WAITING_FOR_REFUND' }
  }
}

async function sendLedgerNotification (account, message) {
  if (account?.type.includes('ledger')) {
    const notificationId = await createNotification({
      title: 'Sign with Ledger',
      message
    })
    const listener = (_id) => {
      if (_id === notificationId) {
        browser.notifications.clear(_id)
        browser.notifications.onClicked.removeListener(listener)
      }
    }
    browser.notifications.onClicked.addListener(listener)
  }
}

async function fundSwap ({ getters }, { order, network, walletId }) {
  if (await hasQuoteExpired({ getters }, { network, walletId, order })) {
    return { status: 'QUOTE_EXPIRED' }
  }

  if (!isERC20(order.from)) return { status: 'FUNDED' } // Skip. Only ERC20 swaps need funding

  const account = getters.accountItem(order.fromAccountId)
  const fromClient = getters.client(network, walletId, order.from, account?.type)

  await sendLedgerNotification(account, 'Signing required to fund the swap.')

  const fundTx = await fromClient.swap.fundSwap(
    {
      value: BN(order.fromAmount),
      recipientAddress: order.fromCounterPartyAddress,
      refundAddress: order.fromAddress,
      secretHash: order.secretHash,
      expiration: order.swapExpiration
    },
    order.fromFundHash,
    order.fee
  )

  return {
    fundTxHash: fundTx.hash,
    status: 'FUNDED'
  }
}

async function reportInitiation ({ getters }, { order, network, walletId }) {
  if (await hasQuoteExpired({ getters }, { network, walletId, order })) {
    return { status: 'WAITING_FOR_REFUND' }
  }

  await updateOrder(order)

  return {
    status: 'INITIATION_REPORTED'
  }
}

async function confirmInitiation ({ state, getters }, { order, network, walletId }) {
  // Jump the step if counter party has already accepted the initiation
  const counterPartyInitiation = await findCounterPartyInitiation({ getters }, { order, network, walletId })
  if (counterPartyInitiation) return counterPartyInitiation
  const account = getters.accountItem(order.fromAccountId)

  const fromClient = getters.client(network, walletId, order.from, account?.type)

  try {
    const tx = await fromClient.chain.getTransactionByHash(order.fromFundHash)

    if (tx && tx.confirmations > 0) {
      return {
        status: 'INITIATION_CONFIRMED'
      }
    }
  } catch (e) {
    if (e.name === 'TxNotFoundError') console.warn(e)
    else throw e
  }
}

async function findCounterPartyInitiation ({ getters }, { order, network, walletId }) {
  const account = getters.accountItem(order.toAccountId)
  const toClient = getters.client(network, walletId, order.to, account?.type)

  try {
    const tx = await toClient.swap.findInitiateSwapTransaction(
      {
        value: BN(order.toAmount),
        recipientAddress: order.toAddress,
        refundAddress: order.toCounterPartyAddress,
        secretHash: order.secretHash,
        expiration: order.nodeSwapExpiration
      }
    )

    if (tx) {
      const toFundHash = tx.hash
      const isVerified = await toClient.swap.verifyInitiateSwapTransaction(
        {
          value: BN(order.toAmount),
          recipientAddress: order.toAddress,
          refundAddress: order.toCounterPartyAddress,
          secretHash: order.secretHash,
          expiration: order.nodeSwapExpiration
        },
        toFundHash
      )

      // ERC20 swaps have separate funding tx. Ensures funding tx has enough confirmations
      const fundingTransaction = await toClient.swap.findFundSwapTransaction(
        {
          value: BN(order.toAmount),
          recipientAddress: order.toAddress,
          refundAddress: order.toCounterPartyAddress,
          secretHash: order.secretHash,
          expiration: order.nodeSwapExpiration
        },
        toFundHash
      )
      const fundingConfirmed = fundingTransaction
        ? fundingTransaction.confirmations >= chains[cryptoassets[order.to].chain].safeConfirmations
        : true

      if (isVerified && fundingConfirmed) {
        return {
          toFundHash,
          status: 'CONFIRM_COUNTER_PARTY_INITIATION'
        }
      }
    }
  } catch (e) {
    if (['BlockNotFoundError', 'PendingTxError', 'TxNotFoundError'].includes(e.name)) console.warn(e)
    else throw e
  }

  // Expiration check should only happen if tx not found
  const expirationUpdates = await handleExpirations({ getters }, { order, network, walletId })
  if (expirationUpdates) { return expirationUpdates }
}

async function confirmCounterPartyInitiation ({ getters }, { order, network, walletId }) {
  const account = getters.accountItem(order.toAccountId)
  const toClient = getters.client(network, walletId, order.to, account?.type)

  const tx = await toClient.chain.getTransactionByHash(order.toFundHash)

  if (tx && tx.confirmations >= chains[cryptoassets[order.to].chain].safeConfirmations) {
    return {
      status: 'READY_TO_CLAIM'
    }
  }

  // Expiration check should only happen if tx not found
  const expirationUpdates = await handleExpirations({ getters }, { order, network, walletId })
  if (expirationUpdates) { return expirationUpdates }
}

async function claimSwap ({ store, getters }, { order, network, walletId }) {
  const expirationUpdates = await handleExpirations({ getters }, { order, network, walletId })
  if (expirationUpdates) { return expirationUpdates }

  const account = getters.accountItem(order.toAccountId)
  const toClient = getters.client(network, walletId, order.to, account?.type)

  await sendLedgerNotification(order, account, 'Signing required to claim the swap.')

  const toClaimTx = await toClient.swap.claimSwap(
    {
      value: BN(order.toAmount),
      recipientAddress: order.toAddress,
      refundAddress: order.toCounterPartyAddress,
      secretHash: order.secretHash,
      expiration: order.nodeSwapExpiration
    },
    order.toFundHash,
    order.secret,
    order.claimFee
  )

  return {
    toClaimHash: toClaimTx.hash,
    toClaimTx,
    status: 'WAITING_FOR_CLAIM_CONFIRMATIONS'
  }
}

async function waitForClaimConfirmations ({ getters, dispatch }, { order, network, walletId }) {
  const account = getters.accountItem(order.toAccountId)
  const toClient = getters.client(network, walletId, order.to, account?.type)

  try {
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
  } catch (e) {
    if (e.name === 'TxNotFoundError') console.warn(e)
    else throw e
  }

  // Expiration check should only happen if tx not found
  const expirationUpdates = await handleExpirations({ getters }, { order, network, walletId })
  if (expirationUpdates) { return expirationUpdates }
}

async function waitForRefund ({ getters }, { order, network, walletId }) {
  if (await canRefund({ getters }, { order, network, walletId })) {
    return { status: 'GET_REFUND' }
  }
}

async function waitForRefundConfirmations ({ getters }, { order, network, walletId }) {
  const account = getters.accountItem(order.fromAccountId)
  const fromClient = getters.client(network, walletId, order.from, account?.type)
  try {
    const tx = await fromClient.chain.getTransactionByHash(order.refundHash)

    if (tx && tx.confirmations > 0) {
      return {
        endTime: Date.now(),
        status: 'REFUNDED'
      }
    }
  } catch (e) {
    if (e.name === 'TxNotFoundError') console.warn(e)
    else throw e
  }
}

async function refundSwap ({ getters }, { order, network, walletId }) {
  const account = getters.accountItem(order.fromAccountId)
  const fromClient = getters.client(network, walletId, order.from, account?.type)
  await sendLedgerNotification(order, account, 'Signing required to refund the swap.')
  const refundTx = await fromClient.swap.refundSwap(
    {
      value: BN(order.fromAmount),
      recipientAddress: order.fromCounterPartyAddress,
      refundAddress: order.fromAddress,
      secretHash: order.secretHash,
      expiration: order.swapExpiration
    },
    order.fromFundHash,
    order.fee
  )

  return {
    refundHash: refundTx.hash,
    refundTx,
    status: 'WAITING_FOR_REFUND_CONFIRMATIONS'
  }
}

async function sendTo ({ state, getters, dispatch }, { order, network, walletId }) {
  const account = getters.accountItem(order.toAccountId)
  const toClient = getters.client(network, walletId, order.to, account?.type)
  const sendToHash = await toClient.chain.sendTransaction({ to: order.sendTo, value: BN(order.toAmount) })

  dispatch('updateBalances', { network, walletId, assets: [order.to, order.from] })

  return {
    sendToHash,
    endTime: Date.now(),
    status: 'SUCCESS'
  }
}

export const performNextSwapAction = async (store, { network, walletId, order }) => {
  let updates
  switch (order.status) {
    case 'INITIATED':
      updates = await reportInitiation(store, { order, network, walletId })
      break

    case 'INITIATION_REPORTED':
      updates = await withInterval(async () => confirmInitiation(store, { order, network, walletId }))
      break

    case 'INITIATION_CONFIRMED':
      updates = await withLock(store, { item: order, network, walletId, asset: order.from },
        async () => fundSwap(store, { order, network, walletId }))
      break

    case 'FUNDED':
      updates = await withInterval(async () => findCounterPartyInitiation(store, { order, network, walletId }))
      break

    case 'CONFIRM_COUNTER_PARTY_INITIATION':
      updates = await withInterval(async () => confirmCounterPartyInitiation(store, { order, network, walletId }))
      break

    case 'READY_TO_CLAIM':
      updates = await withLock(store, { item: order, network, walletId, asset: order.to },
        async () => claimSwap(store, { order, network, walletId }))
      break

    case 'WAITING_FOR_CLAIM_CONFIRMATIONS':
      updates = await withInterval(async () => waitForClaimConfirmations(store, { order, network, walletId }))
      break

    case 'WAITING_FOR_REFUND':
      updates = await withInterval(async () => waitForRefund(store, { order, network, walletId }))
      break

    case 'GET_REFUND':
      updates = await withLock(store, { item: order, network, walletId, asset: order.from },
        async () => refundSwap(store, { order, network, walletId }))
      break

    case 'WAITING_FOR_REFUND_CONFIRMATIONS':
      updates = await withInterval(async () => waitForRefundConfirmations(store, { order, network, walletId }))
      break

    case 'READY_TO_SEND':
      updates = await withLock(store, { item: order, network, walletId, asset: order.to },
        async () => sendTo(store, { order, network, walletId }))
      break
  }

  return updates
}
