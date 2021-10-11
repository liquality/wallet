import buildConfig from '@/build.config'

export const toggleBlockchain = async ({ commit, state, dispatch }, { network, walletId, chainId, enable }) => {
  if (buildConfig.chains.includes(chainId)) {
    commit('TOGGLE_BLOCKCHAIN', { network, walletId, chainId, enable })
  }
}
