import buildConfig from '@/build.config'

export const toggleBlockchain = async ({ commit }, { network, walletId, chainId, enable }) => {
  if (buildConfig.chains.includes(chainId)) {
    commit('TOGGLE_BLOCKCHAIN', { network, walletId, chainId, enable })
  }
}
