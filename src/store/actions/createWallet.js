import { v4 as uuidv4 } from 'uuid'
import { encrypt } from '../../utils/crypto'
import buildConfig from '../../build.config'
import { accountCreator, getNextAccountColor } from '@/utils/accounts'
import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'

export const createWallet = async ({ state, commit, dispatch }, { key, mnemonic }) => {
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

  buildConfig.networks.forEach(network => {
    const assetKeys = state.enabledAssets[network]?.[id] || []
    buildConfig.chains.forEach(async chainId => {
      const assets = assetKeys.filter(asset => {
        return cryptoassets[asset].chain === chainId
      })

      const chain = chains[chainId]
      const _account = accountCreator(
        {
          walletId: id,
          account: {
            name: `${chain.name} 1`,
            chain: chainId,
            addresses: [],
            assets,
            balances: {},
            type: 'default',
            index: 0,
            color: getNextAccountColor(chainId, 0)
          }
        })

      commit('CREATE_ACCOUNT', { network, walletId: id, account: _account })
    })
  })

  return wallet
}
