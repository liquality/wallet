import { v4 as uuidv4 } from 'uuid'
import { encrypt } from '../../utils/crypto'
import buildConfig from '../../build.config'
import { accountCreator, getNextAccountColor } from '@/utils/accounts'
import { getChainFromAsset } from '@/utils/asset'

export const createWallet = async ({ state, getters, commit }, { key, mnemonic }) => {
  const { enabledAssets } = state
  const id = uuidv4()
  const at = Date.now()
  const name = 'Account 1'
  const wallet = { id, name, mnemonic, at, imported: false }

  const { encrypted: encryptedWallets, keySalt } = await encrypt(
    JSON.stringify([wallet]),
    key
  )

  commit('CREATE_WALLET', { keySalt, encryptedWallets, wallet })
  commit('CHANGE_ACTIVE_WALLETID', { walletId: id })
  commit('ENABLE_ASSETS', { network: 'mainnet', walletId: id, assets: buildConfig.defaultAssets.mainnet })
  commit('ENABLE_ASSETS', { network: 'testnet', walletId: id, assets: buildConfig.defaultAssets.testnet })

  for (const network of buildConfig.networks) {
    const assetKeys = enabledAssets[network]?.[id] || []
    for (const chain of buildConfig.chains) {
      const assets = assetKeys.filter(asset => {
        const assetChain = getChainFromAsset(asset)
        return assetChain === chain
      })

      const addresses = []
      for (const asset of assets) {
        const _address = await getters.client(network, id, asset).wallet.getUnusedAddress()
        if (!addresses.includes(_address.address)) {
          addresses.push(_address.address)
        }
      }

      const _account = accountCreator(
        {
          walletId: id,
          account: {
            name: `${chain} 1`,
            chain,
            addresses,
            assets,
            balances: {},
            type: 'default',
            index: 0,
            color: getNextAccountColor(chain, 0)
          }
        })

      commit('CREATE_ACCOUNT', { network, walletId: id, account: _account })
    }
  }
  return wallet
}
