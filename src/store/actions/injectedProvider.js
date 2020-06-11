import { stringify } from 'qs'

import { emitter } from '../utils'
import { createPopup } from '../../broker/utils'

const RESTRICTED = [
  /^chain.buildTransaction$/,
  /^chain.buildBatchTransaction$/,
  /^chain.sendTransaction$/,
  /^chain.sendBatchTransaction$/,
  /^wallet..*$/,
  /^swap.generateSecret$/,
  /^swap.initiateSwap$/,
  /^swap.claimSwap$/,
  /^swap.refundSwap$/
]

export const injectedProvider = async ({ state, getters }, { asset, method, args }) => {
  if (!state.activeWalletId) throw new Error('No active wallet found. Select a wallet first.')

  const client = getters.client(state.activeNetwork, state.activeWalletId, asset)

  if (RESTRICTED.some(re => re.test(method))) {
    const id = Date.now() + '.' + Math.random()

    await new Promise((resolve, reject) => {
      emitter.$once(`permission:${id}`, allowed => {
        if (allowed) resolve(true)
        else reject(new Error('User denied'))
      })

      const query = stringify({
        id,
        asset,
        method,
        args: JSON.stringify(args)
      })

      createPopup(`/permission?${query}`)
    })
  }

  const [namespace, fnName] = method.split('.')

  if (!client[namespace][fnName]) throw new Error('Invalid method')

  return client[namespace][fnName](...args)
}
