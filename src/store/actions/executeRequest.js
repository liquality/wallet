export const executeRequest = async ({ getters, dispatch }, { request }) => {
  // Send transactions through wallet managed action
  if (request.method === 'chain.sendTransaction') {
    return dispatch('sendTransaction', {
      network: request.network,
      walletId: request.walletId,
      asset: request.asset,
      to: request.args[0].to,
      amount: request.args[0].value,
      data: request.args[0].data,
      fee: request.args[0].fee,
      gas: request.args[0].gas
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
