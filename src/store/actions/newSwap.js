import { newOrder } from '../utils'

export const newSwap = async (
  { dispatch, commit },
  {
    network,
    walletId,
    agent,
    from,
    to,
    fromAmount,
    sendTo,
    fee,
    claimFee,
    fromAccountId,
    toAccountId
  }) => {
  const order = await newOrder(agent, {
    from,
    to,
    fromAmount
  })

  order.type = 'SWAP'
  order.network = network
  order.agent = agent
  order.startTime = Date.now()
  order.status = 'QUOTE'
  order.sendTo = sendTo
  order.walletId = walletId
  order.fee = fee
  order.claimFee = claimFee
  order.fromAccountId = fromAccountId
  order.toAccountId = toAccountId

  commit('NEW_ORDER', { network, walletId, order })

  dispatch('performNextAction', { network, walletId, fromAccountId, toAccountId, id: order.id })

  return order
}
