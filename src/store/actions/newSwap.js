import { protocols } from '../../swaps'

export const newSwap = async (
  store,
  {
    network,
    walletId,
    quote,
    fee,
    claimFee,
    fromAccountId,
    toAccountId
  }) => {
  const order = { ...quote }

  // TODO: rename order to swap
  order.type = 'SWAP'
  order.network = network
  order.startTime = Date.now()
  order.walletId = walletId
  order.fee = fee
  order.claimFee = claimFee
  order.fromAccountId = fromAccountId
  order.toAccountId = toAccountId

  const initiationParams = await protocols[order.protocol].newSwap(store, { network, walletId, quote: order })

  const initiatedOrder = {
    ...order,
    ...initiationParams // TODO: Maybe move protocol specific params to an inner property?
  }

  // TODO: rename "ORDER" to "SWAP"
  store.commit('NEW_ORDER', { network, walletId, order: initiatedOrder })

  store.dispatch('performNextAction', { network, walletId, fromAccountId, toAccountId, id: initiatedOrder.id })

  return order
}
