import { newOrder } from '../utils'
import { createSecret, initiateSwap } from './performNextAction/swap'

export const newSwap = async (
  { state, dispatch, commit, getters },
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

  const secreatedCreated = await createSecret({ dispatch, getters }, { order, network, walletId })
  const swapInitiated = await initiateSwap({ state, dispatch, getters },
    {
      order: {
        ...order,
        ...secreatedCreated
      },
      network,
      walletId
    })
  const createdOrder = {
    ...order,
    ...secreatedCreated,
    ...swapInitiated
  }
  console.log('createdOrder', createdOrder)
  commit('NEW_ORDER', { network, walletId, order: createdOrder })

  dispatch('performNextAction', { network, walletId, fromAccountId, toAccountId, id: order.id })

  return order
}
