export const getNFTAssets = async ({ getters, commit }, args) => {
  const { network, walletId } = args
  const client = getters.client({
    network,
    walletId,
    asset: 'ETH'
  })
  const nft = await client.nft.fetch()

  commit('SET_NFT_ASSETS_NUMBER', nft.assets.length)
  const result = nft.assets.reduce(function (r, a) {
    r[a.collection.name] = r[a.collection.name] || []
    chrome.storage.local.get(['liquality-wallet'], (storage) => {
      const state = storage['liquality-wallet']
      console.log('🚀 ~ file: getNFTAssets.js ~ line 15 ~ chrome.storage.local.get ~ state', state)
      if (state.starredNFTs) {
        state.starredNFTs.filter(
          (item) => item.asset_contract.address === a.asset_contract.address && item.id === a.id
        )
          ? (a['starred'] = true)
          : (a['starred'] = false)
      }
    })
    r[a.collection.name].push(a)
    return r
  }, Object.create(null))

  commit('SET_NFT_ASSETS', result)

  return result
}
