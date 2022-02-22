import { createConnectSubscription } from '@/utils/ledger-bridge-provider'

export const executeRequest = async ({ getters, dispatch, rootGetters }, { request }) => {
  // Send transactions through wallet managed action
  const { network, walletId, asset, accountId } = request
  const { accountItem } = getters
  const account = accountItem(accountId)
  let call
  const result = await new Promise((resolve) => {
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
        feeLabel: request.args[0].feeLabel,
        gas: request.args[0].gas
      })
    } else {
      // Otherwise build client
      const client = getters.client({
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

    const ledgerBridgeReady = rootGetters['app/ledgerBridgeReady']
    if (!ledgerBridgeReady && account?.type.includes('ledger')) {
      dispatch('app/startBridgeListener').then(() => {
        createConnectSubscription(() => resolve(call))
      })
    } else {
      resolve(call)
    }
  })
  return result
}
