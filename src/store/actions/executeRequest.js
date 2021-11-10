export const executeRequest = async ({ getters, dispatch, state, rootState }, { request }) => {
  // Send transactions through wallet managed action
  const { network, walletId, asset, accountId } = request
  const { accountItem } = getters
  const account = accountItem(accountId)
  let call
  const result = await new Promise((resolve, reject) => {
    if (request.method === 'chain.sendTransaction') {
      call = dispatch('sendTransaction', {
        network,
        walletId,
        asset,
        accountId,
        to: request.args[0].to,
        amount: request.args[0].value,
        data: request.args[0].data,
        fee: request.args[0].fee,
        gas: request.args[0].gas
      })
    } else {
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

      call = methodFunc(...request.args)
    }

    const { ledgerBridgeConnected, ledgerBridgeTransportConnected } = rootState.app
    if (account?.type.includes('ledger')) {
      if (!ledgerBridgeConnected) {
        dispatch('app/startBridgeListener', {
          onConnect: () => {
            resolve(call)
          }
        }).then(() => {
          dispatch('app/openUSBBridgeWindow')
        })
      } else if (!ledgerBridgeTransportConnected) {
        dispatch('app/startBridgeListener', {
          onTransportConnect: () => {
            resolve(call)
          }
        }).then(() => {
          dispatch('app/openUSBBridgeWindow')
        })
      } else {
        resolve(call)
      }
    } else {
      resolve(call)
    }
  })
  return result
}
