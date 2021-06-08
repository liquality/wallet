import { wait } from '../../store/utils'

export async function hasChainTimePassed ({ getters }, { network, walletId, asset, timestamp }) {
  const client = getters.client(network, walletId, asset)
  const maxTries = 3
  let tries = 0
  while (tries < maxTries) {
    try {
      const blockNumber = await client.chain.getBlockHeight()
      const latestBlock = await client.chain.getBlockByNumber(blockNumber)
      return latestBlock.timestamp > timestamp
    } catch (e) {
      tries++
      if (tries >= maxTries) throw e
      else {
        console.warn(e)
        await wait(2000)
      }
    }
  }
}
