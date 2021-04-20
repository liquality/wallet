import cryptoassets from '@/utils/cryptoassets'

export const disableAssets = async ({ state, commit }, { network, walletId, assets }) => {
  commit('DISABLE_ASSETS', { network, walletId, assets })
  const accounts = state.accounts[walletId]?.[network]
  accounts.filter(a => a.assets.some(s => assets.includes(s)))
    .forEach(account => {
      const _assets = assets.filter(asset => cryptoassets[asset]?.chain === account.chain)
      commit('DISABLE_ACCOUNT_ASSETS', { network, walletId, assets: _assets, accountId: account.id })
    })
}
