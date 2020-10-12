import { stringify } from 'qs'

import { emitter } from '../utils'
import { createPopup } from '../../broker/utils'

const CONFIRM_REQUIRED = [
  /^chain.buildTransaction$/,
  /^chain.buildBatchTransaction$/,
  /^chain.sendTransaction$/,
  /^chain.sendBatchTransaction$/,
  /^chain.updateTransactionFee$/,
  /^wallet.signMessage*$/,
  /^swap.generateSecret$/,
  /^swap.initiateSwap$/,
  /^swap.claimSwap$/,
  /^swap.refundSwap$/
]

const ALLOWED = [
  ...CONFIRM_REQUIRED,
  /^wallet.getAddresses*$/,
  /^jsonrpc$/
]

export const injectedProvider = async ({ state, getters }, { origin, data }) => {
  if (!state.unlockedAt) throw new Error('Wallet is locked. Unlock the wallet first.')
  if (!state.activeWalletId) throw new Error('No active wallet found. Select a wallet first.')

  let { asset, method, args } = data

  if (!ALLOWED.some(re => re.test(method))) throw new Error('Method not allowed')

  const client = getters.client(state.activeNetwork, state.activeWalletId, asset)

  args = args.map(a => {
    if (a === null) return undefined
    return a
  })

  let printArgs = args

  if (printArgs.every(a => a === undefined)) {
    printArgs = []
  }

  if (CONFIRM_REQUIRED.some(re => re.test(method))) {
    const id = Date.now() + '.' + Math.random()

    await new Promise((resolve, reject) => {
      emitter.$once(`permission:${id}`, allowed => {
        if (allowed) resolve(true)
        else reject(new Error('User denied'))
      })

      const query = stringify({
        id,
        origin,
        asset,
        method,
        args: JSON.stringify(printArgs)
      })

      createPopup(`/permission?${query}`)
    })
  }

  let methodFunc
  if (method.includes('.')) {
    const [namespace, fnName] = method.split('.')
    methodFunc = client[namespace][fnName].bind(client[namespace])
  } else {
    methodFunc = client.getMethod(method).bind(client)
  }

  return methodFunc(...args)
}
