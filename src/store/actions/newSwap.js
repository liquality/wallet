export const newSwap = async (
  store,
  {
    network,
    walletId,
    quote,
    fee,
    claimFee,
    feeLabel,
    claimFeeLabel
  }) => {
  const swap = { ...quote }

  swap.type = 'SWAP'
  swap.network = network
  swap.startTime = Date.now()
  swap.walletId = walletId
  swap.fee = fee
  swap.claimFee = claimFee

  const swapProvider = store.getters.swapProvider(network, swap.provider)
  const initiationParams = await swapProvider.newSwap({ network, walletId, quote: swap })

  const createdSwap = {
    ...swap,
    ...initiationParams // TODO: Maybe move provider specific params to an inner property?
  }

  store.commit('NEW_SWAP', {
    network,
    walletId,
    swap: createdSwap,
    feeLabel,
    claimFeeLabel
  })

  store.dispatch('performNextAction', { network, walletId, id: createdSwap.id })

  return createdSwap
}
