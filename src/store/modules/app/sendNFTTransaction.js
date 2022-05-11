export const sendNFTTransaction = async ({ getters }, args) => {
  const { network, walletId, contract, receiver, tokenIDs, values, data, fee } = args
  const client = getters.client({
    network,
    walletId,
    asset: 'ETH'
  })

  const nft = await client.nft.transfer(contract, receiver, tokenIDs, values, data, fee)
  console.log('🚀 ~ file: sendNFT.js ~ line 10 ~ sendNFT ~ nft', nft)
}
