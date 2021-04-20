import cryptoassets from '@/utils/cryptoassets'

export const enableAssets = async ({ state, commit, dispatch }, { network, walletId, assets }) => {
  commit('ENABLE_ASSETS', { network, walletId, assets })
  const accounts = state.accounts[walletId]?.[network]
  accounts.forEach(async account => {
    const accountId = account.id
    const _assets = assets.filter(asset => cryptoassets[asset]?.chain === account.chain)
    if (_assets && _assets.length > 0) {
      commit('ENABLE_ACCOUNT_ASSETS', { network, walletId, assets: _assets, accountId })
      await dispatch('updateAccountBalance', { network, walletId, accountId })
    }
  })
  dispatch('updateFiatRates')
  dispatch('updateMarketData', { network })
}
