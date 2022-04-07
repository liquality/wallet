export const executeRequest = async ({ rootGetters, dispatch, rootState }, { request }) => {
  // Send transactions through wallet managed action
  const { network, walletId, asset, accountId } = request
  const { accountItem } = rootGetters
  const account = accountItem(accountId)
  let call
  const result = await new Promise((resolve) => {
    if (request.method === 'chain.sendTransaction') {
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

    const { ledgerBridgeConnected, ledgerBridgeTransportConnected } = rootState.app
    if (account?.type.includes('ledger')) {
      if (!ledgerBridgeConnected) {
        dispatch('startBridgeListener', {
          onConnect: () => {
            resolve(call)
          }
        }).then(() => {
          dispatch('openUSBBridgeWindow')
        })
      } else if (!ledgerBridgeTransportConnected) {
        dispatch('startBridgeListener', {
          onTransportConnect: () => {
            resolve(call)
          }
        }).then(() => {
          dispatch('openUSBBridgeWindow')
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
