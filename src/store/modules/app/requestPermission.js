import { stringify } from 'qs'
import { emitter } from '../../utils'
import { createPopup } from '../../../broker/utils'
import { ChainId } from '@liquality/cryptoassets'
import {
  CUSTOM_ERRORS,
  createInternalError,
  NoActiveWalletError,
  WalletLockedError,
  UserDeclinedError
} from '@liquality/error-parser'

const CONFIRM_REQUIRED = [
  /^wallet.buildTransaction$/,
  /^wallet.buildBatchTransaction$/,
  /^wallet.sendTransaction$/,
  /^wallet.sendBatchTransaction$/,
  /^wallet.updateTransactionFee$/,
  /^wallet.signMessage*$/,
  /^wallet.signTypedData*$/,
  /^swap.generateSecret$/,
  /^swap.initiateSwap$/,
  /^swap.claimSwap$/,
  /^swap.refundSwap$/,
  /^swap.updateTransactionFee$/,

  // Bitcoin
  /^wallet.signPSBT$/
]

const ALLOWED = [
  ...CONFIRM_REQUIRED,
  /^wallet.getConnectedNetwork$/,
  /^wallet.getAddresses*$/,
  /^chain.sendRpcRequest$/
]

export const requestPermission = async (
  { state, dispatch, commit, rootState, rootGetters },
  { origin, data }
) => {
  const { requestPermissionActive } = state
  if (!requestPermissionActive) {
    commit('SET_REQUEST_PERMISSION_ACTIVE', { active: true })
    await dispatch('requestUnlockWallet')
    if (!rootState.unlockedAt) throw new WalletLockedError()
    if (!rootState.activeWalletId) throw new NoActiveWalletError()

    let { asset, accountId, method, args, chain } = data

    if (!ALLOWED.some((re) => re.test(method)))
      throw createInternalError(CUSTOM_ERRORS.Unsupported.Method)

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
          if (!response.allowed) reject(new UserDeclinedError())
          if (response.error) reject(new Error(response.error))
          resolve(response.result)
        })

        const query = stringify({
          id,
          ...request,
          args: JSON.stringify(request.args)
        })

        console.log('query', query)
        let permissionRoute = '/permission/default'

        if (chain === ChainId.Terra) {
          permissionRoute = '/permission/terra'
        } else if (method === 'wallet.sendTransaction') {
          permissionRoute = '/permission/send'
        } else if (method === 'wallet.signMessage' || method === 'wallet.signTypedData') {
          permissionRoute = '/permission/sign'
        } else if (method === 'wallet.signPSBT') {
          permissionRoute = '/permission/signPsbt'
        }

        const url = `${permissionRoute}?${query}`
        const account = rootGetters.accountItem(accountId)

        if (account?.type.includes('ledger')) {
          browser.tabs.create({ url: browser.runtime.getURL(`/index.html#${url}`) })
        } else {
          createPopup(url, () => reject(new UserDeclinedError()))
        }
      })
    } else {
      commit('SET_REQUEST_PERMISSION_ACTIVE', { active: false })
      return dispatch('executeRequest', { request })
    }
  }
}
