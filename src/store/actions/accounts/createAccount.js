import { accountCreator } from '@/utils/accounts'

export const createAccount = async (
  { commit }, payload) => {
  const { walletId, network, account } = payload
  const _account = accountCreator({ network, walletId, account })

  commit('CREATE_ACCOUNT', { network, walletId, account: _account })
  return _account
}
