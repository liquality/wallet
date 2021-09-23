import buildConfig from '@/build.config'

export const toogleBlockchain = async ({ commit, state, dispatch }, { network, walletId, chainId, enable }) => {
  if (buildConfig.chains.includes(chainId)) {
    commit('TOOGLE_BLOCKCHAIN', { network, walletId, chainId, enable })
    if (!enable) {
      state.accounts[walletId][network]
        .filter(a => a.chain === chainId)
        .forEach(account => {
          dispatch('toogleAccount', { network, walletId, accountId: account.id, enable })
        })
    }
  }
}
