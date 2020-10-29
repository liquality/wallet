export const executeRequest = async ({ getters, dispatch }, { request }) => {
  // Send transactions through wallet managed action
  if (request.method === 'chain.sendTransaction') {
    return dispatch('sendTransaction', {
      network: request.network,
      walletId: request.walletId,
      asset: request.asset,
      to: request.args[0],
      amount: request.args[1],
      data: request.args[2],
      fee: request.args[3]
    })
  }

  // Otherwise build client
  const client = getters.client(request.network, request.walletId, request.asset)
  let methodFunc
  if (request.method.includes('.')) {
    const [namespace, fnName] = request.method.split('.')
    methodFunc = client[namespace][fnName].bind(client[namespace])
  } else {
    methodFunc = client.getMethod(request.method).bind(client)
  }

  return methodFunc(...request.args)
}
