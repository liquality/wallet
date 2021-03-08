import { newOrder } from '../utils'

export const newSwap = async ({ dispatch, commit }, { network, walletId, agent, from, to, fromAmount, sendTo, fee, claimFee }) => {
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

  commit('NEW_ORDER', { network, walletId, order })

  dispatch('performNextAction', { network, walletId, id: order.id })

  return order
}
