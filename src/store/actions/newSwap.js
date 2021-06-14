import { getSwapProtocol } from '../../utils/swaps'

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
  const swap = { ...quote }

  swap.type = 'SWAP'
  swap.network = network
  swap.startTime = Date.now()
  swap.walletId = walletId
  swap.fee = fee
  swap.claimFee = claimFee
  swap.fromAccountId = fromAccountId
  swap.toAccountId = toAccountId

  const initiationParams = await getSwapProtocol(network, swap.protocol).newSwap(store, { network, walletId, quote: swap })

  const createdSwap = {
    ...swap,
    ...initiationParams // TODO: Maybe move protocol specific params to an inner property?
  }

  store.commit('NEW_SWAP', { network, walletId, swap: createdSwap })

  store.dispatch('performNextAction', { network, walletId, fromAccountId, toAccountId, id: createdSwap.id })

  return createdSwap
}
