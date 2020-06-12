import { stringify } from 'qs'

import { emitter } from '../utils'
import { createPopup } from '../../broker/utils'

const RESTRICTED = [
  /^chain.buildTransaction$/,
  /^chain.buildBatchTransaction$/,
  /^chain.sendTransaction$/,
  /^chain.sendBatchTransaction$/,
  /^wallet.signMessage*$/,
  /^swap.generateSecret$/,
  /^swap.initiateSwap$/,
  /^swap.claimSwap$/,
  /^swap.refundSwap$/
]

export const injectedProvider = async ({ state, getters }, { origin, data }) => {
  if (!state.unlockedAt) throw new Error('Wallet is locked. Unlock the wallet first.')
  if (!state.activeWalletId) throw new Error('No active wallet found. Select a wallet first.')

  let { asset, method, args } = data
  const client = getters.client(state.activeNetwork, state.activeWalletId, asset)

  args = args.map(a => {
    if (a === null) return undefined
    return a
  })

  let printArgs = args

  if (printArgs.every(a => a === undefined)) {
    printArgs = []
  }

  if (RESTRICTED.some(re => re.test(method))) {
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

  const [namespace, fnName] = method.split('.')

  if (!client[namespace][fnName]) throw new Error('Invalid method')

  return client[namespace][fnName](...args)
}
