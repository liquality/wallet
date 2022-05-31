import { stringify } from 'qs'

import { emitter } from '../../utils'
import { createPopup } from '../../../broker/utils'

const CONFIRM_REQUIRED = [
  /^chain.buildTransaction$/,
  /^chain.buildBatchTransaction$/,
  /^chain.sendTransaction$/,
  /^chain.sendBatchTransaction$/,
  /^chain.updateTransactionFee$/,
  /^wallet.signMessage*$/,
  /^wallet.signTypedMessage*$/,
  /^swap.generateSecret$/,
  /^swap.initiateSwap$/,
  /^swap.claimSwap$/,
  /^swap.refundSwap$/,

  // Bitcoin
  /^signPSBT$/
]

const ALLOWED = [
  ...CONFIRM_REQUIRED,
  /^wallet.getConnectedNetwork$/,
  /^wallet.getAddresses*$/,
  /^jsonrpc$/
]

export const requestPermission = async (
  { state, dispatch, commit, rootState },
  { origin, data }
) => {
  const { requestPermissionActive } = state
  if (!requestPermissionActive) {
    commit('SET_REQUEST_PERMISSION_ACTIVE', { active: true })
    await dispatch('requestUnlockWallet')
    if (!rootState.unlockedAt) throw new Error('Wallet is locked. Unlock the wallet first.')
    if (!rootState.activeWalletId) throw new Error('No active wallet found. Create a wallet first.')

    let { asset, accountId, method, args, chain } = data

    if (!ALLOWED.some((re) => re.test(method))) throw new Error('Method not allowed')

    const { activeNetwork: network, activeWalletId: walletId } = rootState

    args = args.map((a) => {
      if (a === null) return undefined
      return a
    })

    let printArgs = args

    if (printArgs.every((a) => a === undefined)) {
      printArgs = []
    }

    const request = {
      origin,
      asset,
      accountId,
      network,
      walletId,
      method,
      args: printArgs
    }



    if (CONFIRM_REQUIRED.some((re) => re.test(method))) {
      const id = Date.now() + '.' + Math.random()

      return new Promise((resolve, reject) => {
        commit('SET_REQUEST_PERMISSION_ACTIVE', { active: false })
        emitter.$once(`permission:${id}`, (response) => {
          if (!response.allowed) reject(new Error('User denied'))
          if (response.error) reject(new Error(response.error))
          resolve(response.result)
        })

        const query = stringify({
          id,
          ...request,
          args: JSON.stringify(request.args)
        })

        let permissionRoute = '/permission/default'

        if (chain === 'terra') permissionRoute = '/permission/terra'
        else if (method === 'chain.sendTransaction') permissionRoute = '/permission/send'
        else if (method === 'wallet.signMessage' || method === 'wallet.signTypedMessage') permissionRoute = '/permission/sign'
        else if (method === 'signPSBT') permissionRoute = '/permission/signPsbt'

        createPopup(`${permissionRoute}?${query}`, () => reject(new Error('User denied')))
      })
    } else {
      commit('SET_REQUEST_PERMISSION_ACTIVE', { active: false })
      return dispatch('executeRequest', { request })
    }
  }
}
