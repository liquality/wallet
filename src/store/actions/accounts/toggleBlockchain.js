import buildConfig from '@/build.config'

export const toggleBlockchain = async ({ commit, state, dispatch }, { network, walletId, chainId, enable }) => {
  if (buildConfig.chains.includes(chainId)) {
    commit('TOGGLE_BLOCKCHAIN', { network, walletId, chainId, enable })
    if (!enable) {
      state.accounts[walletId][network]
        .filter(a => a.chain === chainId)
        .forEach(account => {
          dispatch('toggleAccount', { network, walletId, accountId: account.id, enable })
        })
    }
  }
}
