import cryptoassets from '@/utils/cryptoassets'
import { accountCreator, getNextAccountColor } from '@/utils/accounts'
import { chains } from '@liquality/cryptoassets'

export const enableAssets = async ({ state, commit, dispatch, getters }, { network, walletId, assets }) => {
  commit('ENABLE_ASSETS', { network, walletId, assets })
  const accounts = state.accounts[walletId]?.[network] || []

  // try to find if we need to create a new account
  const accountsChains = accounts.map(a => a.chain)
  const accountsToCreate = assets.filter(asset => !!cryptoassets[asset]?.chain)
    .map(asset => cryptoassets[asset]?.chain)
    .filter(chainId => !accountsChains.includes(chainId))
    .map(async chainId => {
      const chain = chains[chainId]
      const _assets = assets.filter(asset => cryptoassets[asset]?.chain === chainId)
      const _account = accountCreator(
        {
          walletId,
          network,
          account: {
            name: `${chain.name} 1`,
            chain: chainId,
            addresses: [],
            assets: _assets,
            balances: {},
            type: 'default',
            index: 0,
            color: getNextAccountColor(chainId, 0)
          }
        })
      commit('CREATE_ACCOUNT', { network, walletId, account: _account })
      await dispatch('getUnusedAddresses', { network, walletId, assets: _account.assets, accountId: _account.id })
    })

  if (accountsToCreate.length > 0) {
    await Promise.all(accountsToCreate)
  }

  accounts.forEach(async account => {
    const accountId = account.id
    const _assets = assets.filter(asset => cryptoassets[asset]?.chain === account.chain)
    if (_assets && _assets.length > 0) {
      commit('ENABLE_ACCOUNT_ASSETS', { network, walletId, assets: _assets, accountId })
      await dispatch('updateAccountBalance', { network, walletId, accountId })
    }
  })
  dispatch('updateFiatRates', { assets: getters.allNetworkAssets })
  dispatch('updateMarketData', { network })
}
