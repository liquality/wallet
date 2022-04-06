export const getNFTAssets = async ({ getters, commit, state }, args) => {
  const { network, walletId } = args
  const client = getters.client({
    network,
    walletId,
    asset: 'ETH'
  })

  const nft = await client.nft.fetch()

  nft.assets.forEach((asset) => {
    if (state.starredNFTs) {
      asset['starred'] = state.starredNFTs.filter(
        (item) =>
          item.asset_contract.address === asset.asset_contract.address && item.id === asset.id
      ).length
        ? true
        : false
    } else {
      asset['starred'] = false
    }
  })

  commit('SET_NFT_ASSETS_NUMBER', nft.assets.length)

  let result = nft.assets.reduce(function (r, a) {
    r[a.collection.name] = r[a.collection.name] || []
    r[a.collection.name].push(a)
    r[a.collection.name].sort(function (a, b) {
      return a.starred === b.starred ? 0 : a.starred ? -1 : 1
    })
    return r
  }, Object.create(null))

  commit('SET_NFT_ASSETS', result)

  return result
}
