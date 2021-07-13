export const executeRequest = async ({ getters, dispatch, state }, { request }) => {
  // Send transactions through wallet managed action
  const { network, walletId, asset, origin } = request
  const { externalConnections, activeWalletId } = state
  const accounts = externalConnections[activeWalletId]?.[origin] || []
  const [accountId] = accounts
  if (request.method === 'chain.sendTransaction') {
    return dispatch('sendTransaction', {
      network,
      walletId,
      asset,
      to: request.args[0].to,
      amount: request.args[0].value,
      data: request.args[0].data,
      fee: request.args[0].fee,
      gas: request.args[0].gas,
      accountId
    })
  }

  // Otherwise build client
  const client = getters.client(
    {
      network,
      walletId,
      asset,
      accountId
    }
  )
  let methodFunc
  if (request.method.includes('.')) {
    const [namespace, fnName] = request.method.split('.')
    methodFunc = client[namespace][fnName].bind(client[namespace])
  } else {
    methodFunc = client.getMethod(request.method).bind(client)
  }

  return methodFunc(...request.args)
}
