import { accountCreator } from '@/utils/accounts'

export const createAccount = async (
  { commit, dispatch }, payload) => {
  const { walletId, network, account } = payload
  const _account = accountCreator({ network, walletId, account })

  commit('CREATE_ACCOUNT', { network, walletId, account: _account })

  await dispatch('getUnusedAddresses', {
    network,
    walletId,
    assets: _account.assets,
    accountId: _account.id
  })
  await dispatch('updateAccountBalance', {
    network,
    walletId,
    accountId: _account.id
  })

  return _account
}
