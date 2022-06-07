export const executeRequest = async ({ rootGetters, dispatch }, { request }) => {
  // Send transactions through wallet managed action
  const { network, walletId, asset, accountId } = request
  let call
  const result = await new Promise((resolve) => {
    if (request.method === 'wallet.sendTransaction') {
      call = dispatch(
        'sendTransaction',
        {
          network,
          walletId,
          asset,
          accountId,
          to: request.args[0].to,
          amount: request.args[0].value,
          data: request.args[0].data,
          fee: request.args[0].fee,
          feeLabel: request.args[0].feeLabel,
          gas: request.args[0].gas
        },
        { root: true }
      )
    } else {
      // Otherwise build client
      const client = rootGetters.client({
        network,
        walletId,
        asset,
        accountId
      })
      let methodFunc
      if (request.method.includes('.')) {
        const [namespace, fnName] = request.method.split('.')
        methodFunc = client[namespace][fnName].bind(client[namespace])
      } else {
        methodFunc = client.getMethod(request.method).bind(client)
      }

      call = methodFunc(...request.args)
    }
    resolve(call)
  })
  return result
}
