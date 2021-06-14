import axios from 'axios'
import { chains, unitToCurrency, currencyToUnit } from '@liquality/cryptoassets'
import { sha256 } from '@liquality/crypto'
import pkg from '../../../package.json'
import { withLock, withInterval } from '../../store/actions/performNextAction/utils'
import { hasChainTimePassed } from './utils'
import { timestamp } from '../../store/utils'
import { createNotification } from '../../broker/notification'
import BN from 'bignumber.js'
import { isERC20 } from '@/utils/asset'
import cryptoassets from '@/utils/cryptoassets'
import { getSwapProtocolConfig } from '../../utils/swaps'

export const VERSION_STRING = `Wallet ${pkg.version} (CAL ${pkg.dependencies['@liquality/client'].replace('^', '').replace('~', '')})`

async function _getQuote ({ agent, from, to, amount }) {
  return (await axios({
    url: agent + '/api/swap/order',
    method: 'post',
    data: { from, to, fromAmount: amount },
    headers: {
      'x-requested-with': VERSION_STRING,
      'x-liquality-user-agent': VERSION_STRING
    }
  })).data
}

export async function getSupportedPairs ({ commit, getters, state }, { network, protocol }) {
  const agent = getSwapProtocolConfig(network, protocol).agent
  const markets = (await axios({
    url: agent + '/api/swap/marketinfo',
    method: 'get',
    headers: {
      'x-requested-with': VERSION_STRING,
      'x-liquality-user-agent': VERSION_STRING
    }
  })).data

  const pairs = markets
    .filter(market => cryptoassets[market.from] && cryptoassets[market.to])
    .map(market => ({
      from: market.from,
      to: market.to,
      min: BN(unitToCurrency(cryptoassets[market.from], market.min)).toFixed(),
      max: BN(unitToCurrency(cryptoassets[market.from], market.max)).toFixed(),
      rate: BN(market.rate).toFixed(),
      protocol
    }))

  return pairs
}

export async function getQuote ({ commit, getters, state }, { network, protocol, from, to, amount }) {
  // Quotes are retrieved using market data because direct quotes take a long time for BTC swaps (agent takes long to generate new address)
  const market = state.marketData[network].find(market =>
    market.protocol === protocol &&
    market.to === to &&
    market.from === from &&
    BN(amount).gte(BN(market.min)) &&
    BN(amount).lte(BN(market.max)))

  if (!market) return null

  const fromAmount = currencyToUnit(cryptoassets[from], amount)
  const toAmount = currencyToUnit(cryptoassets[to], BN(amount).times(BN(market.rate)))

  // Should have from, to, fromamount, toamount
  // TODO: slippage %
  // Perhaps include fees here?

  // TODO: numbers should come out in bignumber
  return {
    from, to, fromAmount: fromAmount.toNumber(), toAmount: toAmount.toNumber()
  }
}

export async function newSwap ({ commit, getters, dispatch }, { network, walletId, quote: _quote }) {
  const agent = getSwapProtocolConfig(network, _quote.protocol).agent

  // TODO: Check for a slippage between this rate and calculated quote?
  const lockedQuote = await _getQuote({ agent, from: _quote.from, to: _quote.to, amount: _quote.fromAmount })

  const quote = {
    ..._quote,
    ...lockedQuote
  }

  if (await hasQuoteExpired({ getters }, { network, walletId, swap: quote })) {
    throw new Error('The quote is expired')
  }

  const [fromAddress] = await dispatch('getUnusedAddresses', { network, walletId, assets: [quote.from], accountId: quote.fromAccountId })
  const [toAddress] = await dispatch('getUnusedAddresses', { network, walletId, assets: [quote.to], accountId: quote.toAccountId })
  quote.fromAddress = fromAddress.toString()
  quote.toAddress = toAddress.toString()

  const account = getters.accountItem(quote.fromAccountId)
  const fromClient = getters.client(network, walletId, quote.from, account?.type)

  const message = [
    'Creating a swap with following terms:',
    `Send: ${quote.fromAmount} (lowest denomination) ${quote.from}`,
    `Receive: ${quote.toAmount} (lowest denomination) ${quote.to}`,
    `My ${quote.from} Address: ${quote.fromAddress}`,
    `My ${quote.to} Address: ${quote.toAddress}`,
    `Counterparty ${quote.from} Address: ${quote.fromCounterPartyAddress}`,
    `Counterparty ${quote.to} Address: ${quote.toCounterPartyAddress}`,
    `Timestamp: ${quote.swapExpiration}`
  ].join('\n')

  const messageHex = Buffer.from(message, 'utf8').toString('hex')
  const secret = await fromClient.swap.generateSecret(messageHex)
  const secretHash = sha256(secret)

  const fromFundTx = await fromClient.swap.initiateSwap(
    {
      value: BN(quote.fromAmount),
      recipientAddress: quote.fromCounterPartyAddress,
      refundAddress: quote.fromAddress,
      secretHash: secretHash,
      expiration: quote.swapExpiration
    },
    quote.fee
  )

  return {
    ...quote,
    status: 'INITIATED',
    secret,
    secretHash,
    fromFundHash: fromFundTx.hash,
    fromFundTx
  }
}

export async function updateOrder (agent, order) {
  return axios({
    url: agent + '/api/swap/order/' + order.id,
    method: 'post',
    data: {
      fromAddress: order.fromAddress,
      toAddress: order.toAddress,
      fromFundHash: order.fromFundHash,
      secretHash: order.secretHash
    },
    headers: {
      'x-requested-with': VERSION_STRING,
      'x-liquality-user-agent': VERSION_STRING
    }
  }).then(res => res.data)
}

export async function hasQuoteExpired (store, { swap }) {
  return timestamp() >= swap.expiresAt
}

async function canRefund ({ getters }, { network, walletId, swap }) {
  return hasChainTimePassed({ getters }, { network, walletId, asset: swap.from, timestamp: swap.swapExpiration, fromAccountId: swap.fromAccountId })
}

export async function hasSwapExpired ({ getters }, { network, walletId, swap }) {
  return hasChainTimePassed({ getters }, { network, walletId, asset: swap.to, timestamp: swap.nodeSwapExpiration, fromAccountId: swap.fromAccountId })
}

async function handleExpirations ({ getters }, { network, walletId, swap }) {
  if (await canRefund({ getters }, { swap, network, walletId })) {
    return { status: 'GET_REFUND' }
  }
  if (await hasSwapExpired({ getters }, { swap, network, walletId })) {
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

async function fundSwap ({ getters }, { swap, network, walletId }) {
  if (await hasQuoteExpired({ getters }, { network, walletId, swap })) {
    return { status: 'QUOTE_EXPIRED' }
  }

  if (!isERC20(swap.from)) return { status: 'FUNDED' } // Skip. Only ERC20 swaps need funding

  const account = getters.accountItem(swap.fromAccountId)
  const fromClient = getters.client(network, walletId, swap.from, account?.type)

  await sendLedgerNotification(account, 'Signing required to fund the swap.')

  const fundTx = await fromClient.swap.fundSwap(
    {
      value: BN(swap.fromAmount),
      recipientAddress: swap.fromCounterPartyAddress,
      refundAddress: swap.fromAddress,
      secretHash: swap.secretHash,
      expiration: swap.swapExpiration
    },
    swap.fromFundHash,
    swap.fee
  )

  return {
    fundTxHash: fundTx.hash,
    status: 'FUNDED'
  }
}

async function reportInitiation ({ getters }, { swap, network, walletId }) {
  if (await hasQuoteExpired({ getters }, { network, walletId, swap })) {
    return { status: 'WAITING_FOR_REFUND' }
  }

  const agent = getSwapProtocolConfig(network, swap.protocol).agent
  await updateOrder(agent, swap)

  return {
    status: 'INITIATION_REPORTED'
  }
}

async function confirmInitiation ({ state, getters }, { swap, network, walletId }) {
  // Jump the step if counter party has already accepted the initiation
  const counterPartyInitiation = await findCounterPartyInitiation({ getters }, { swap, network, walletId })
  if (counterPartyInitiation) return counterPartyInitiation
  const account = getters.accountItem(swap.fromAccountId)

  const fromClient = getters.client(network, walletId, swap.from, account?.type)

  try {
    const tx = await fromClient.chain.getTransactionByHash(swap.fromFundHash)

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

async function findCounterPartyInitiation ({ getters }, { swap, network, walletId }) {
  const account = getters.accountItem(swap.toAccountId)
  const toClient = getters.client(network, walletId, swap.to, account?.type)

  try {
    const tx = await toClient.swap.findInitiateSwapTransaction(
      {
        value: BN(swap.toAmount),
        recipientAddress: swap.toAddress,
        refundAddress: swap.toCounterPartyAddress,
        secretHash: swap.secretHash,
        expiration: swap.nodeSwapExpiration
      }
    )

    if (tx) {
      const toFundHash = tx.hash
      const isVerified = await toClient.swap.verifyInitiateSwapTransaction(
        {
          value: BN(swap.toAmount),
          recipientAddress: swap.toAddress,
          refundAddress: swap.toCounterPartyAddress,
          secretHash: swap.secretHash,
          expiration: swap.nodeSwapExpiration
        },
        toFundHash
      )

      // ERC20 swaps have separate funding tx. Ensures funding tx has enough confirmations
      const fundingTransaction = await toClient.swap.findFundSwapTransaction(
        {
          value: BN(swap.toAmount),
          recipientAddress: swap.toAddress,
          refundAddress: swap.toCounterPartyAddress,
          secretHash: swap.secretHash,
          expiration: swap.nodeSwapExpiration
        },
        toFundHash
      )
      const fundingConfirmed = fundingTransaction
        ? fundingTransaction.confirmations >= chains[cryptoassets[swap.to].chain].safeConfirmations
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
  const expirationUpdates = await handleExpirations({ getters }, { swap, network, walletId })
  if (expirationUpdates) { return expirationUpdates }
}

async function confirmCounterPartyInitiation ({ getters }, { swap, network, walletId }) {
  const account = getters.accountItem(swap.toAccountId)
  const toClient = getters.client(network, walletId, swap.to, account?.type)

  const tx = await toClient.chain.getTransactionByHash(swap.toFundHash)

  if (tx && tx.confirmations >= chains[cryptoassets[swap.to].chain].safeConfirmations) {
    return {
      status: 'READY_TO_CLAIM'
    }
  }

  // Expiration check should only happen if tx not found
  const expirationUpdates = await handleExpirations({ getters }, { swap, network, walletId })
  if (expirationUpdates) { return expirationUpdates }
}

async function claimSwap ({ store, getters }, { swap, network, walletId }) {
  const expirationUpdates = await handleExpirations({ getters }, { swap, network, walletId })
  if (expirationUpdates) { return expirationUpdates }

  const account = getters.accountItem(swap.toAccountId)
  const toClient = getters.client(network, walletId, swap.to, account?.type)

  await sendLedgerNotification(swap, account, 'Signing required to claim the swap.')

  const toClaimTx = await toClient.swap.claimSwap(
    {
      value: BN(swap.toAmount),
      recipientAddress: swap.toAddress,
      refundAddress: swap.toCounterPartyAddress,
      secretHash: swap.secretHash,
      expiration: swap.nodeSwapExpiration
    },
    swap.toFundHash,
    swap.secret,
    swap.claimFee
  )

  return {
    toClaimHash: toClaimTx.hash,
    toClaimTx,
    status: 'WAITING_FOR_CLAIM_CONFIRMATIONS'
  }
}

async function waitForClaimConfirmations ({ getters, dispatch }, { swap, network, walletId }) {
  const account = getters.accountItem(swap.toAccountId)
  const toClient = getters.client(network, walletId, swap.to, account?.type)

  try {
    const tx = await toClient.chain.getTransactionByHash(swap.toClaimHash)

    if (tx && tx.confirmations > 0) {
      dispatch('updateBalances', { network, walletId, assets: [swap.to, swap.from] })

      return {
        endTime: Date.now(),
        status: 'SUCCESS'
      }
    }
  } catch (e) {
    if (e.name === 'TxNotFoundError') console.warn(e)
    else throw e
  }

  // Expiration check should only happen if tx not found
  const expirationUpdates = await handleExpirations({ getters }, { swap, network, walletId })
  if (expirationUpdates) { return expirationUpdates }
}

async function waitForRefund ({ getters }, { swap, network, walletId }) {
  if (await canRefund({ getters }, { swap, network, walletId })) {
    return { status: 'GET_REFUND' }
  }
}

async function waitForRefundConfirmations ({ getters }, { swap, network, walletId }) {
  const account = getters.accountItem(swap.fromAccountId)
  const fromClient = getters.client(network, walletId, swap.from, account?.type)
  try {
    const tx = await fromClient.chain.getTransactionByHash(swap.refundHash)

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

async function refundSwap ({ getters }, { swap, network, walletId }) {
  const account = getters.accountItem(swap.fromAccountId)
  const fromClient = getters.client(network, walletId, swap.from, account?.type)
  await sendLedgerNotification(swap, account, 'Signing required to refund the swap.')
  const refundTx = await fromClient.swap.refundSwap(
    {
      value: BN(swap.fromAmount),
      recipientAddress: swap.fromCounterPartyAddress,
      refundAddress: swap.fromAddress,
      secretHash: swap.secretHash,
      expiration: swap.swapExpiration
    },
    swap.fromFundHash,
    swap.fee
  )

  return {
    refundHash: refundTx.hash,
    refundTx,
    status: 'WAITING_FOR_REFUND_CONFIRMATIONS'
  }
}

export async function performNextSwapAction (store, { network, walletId, swap }) {
  let updates
  switch (swap.status) {
    case 'INITIATED':
      updates = await reportInitiation(store, { swap, network, walletId })
      break

    case 'INITIATION_REPORTED':
      updates = await withInterval(async () => confirmInitiation(store, { swap, network, walletId }))
      break

    case 'INITIATION_CONFIRMED':
      updates = await withLock(store, { item: swap, network, walletId, asset: swap.from },
        async () => fundSwap(store, { swap, network, walletId }))
      break

    case 'FUNDED':
      updates = await withInterval(async () => findCounterPartyInitiation(store, { swap, network, walletId }))
      break

    case 'CONFIRM_COUNTER_PARTY_INITIATION':
      updates = await withInterval(async () => confirmCounterPartyInitiation(store, { swap, network, walletId }))
      break

    case 'READY_TO_CLAIM':
      updates = await withLock(store, { item: swap, network, walletId, asset: swap.to },
        async () => claimSwap(store, { swap, network, walletId }))
      break

    case 'WAITING_FOR_CLAIM_CONFIRMATIONS':
      updates = await withInterval(async () => waitForClaimConfirmations(store, { swap, network, walletId }))
      break

    case 'WAITING_FOR_REFUND':
      updates = await withInterval(async () => waitForRefund(store, { swap, network, walletId }))
      break

    case 'GET_REFUND':
      updates = await withLock(store, { item: swap, network, walletId, asset: swap.from },
        async () => refundSwap(store, { swap, network, walletId }))
      break

    case 'WAITING_FOR_REFUND_CONFIRMATIONS':
      updates = await withInterval(async () => waitForRefundConfirmations(store, { swap, network, walletId }))
      break
  }

  return updates
}
