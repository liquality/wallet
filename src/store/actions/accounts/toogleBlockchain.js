import buildConfig from '@/build.config'

export const toogleBlockchain = async ({ commit }, { network, walletId, chainId, enable }) => {
  if (buildConfig.chains.includes(chainId)) {
    commit('TOOGLE_BLOCKCHAIN', { network, walletId, chainId, enable })
  }
}
