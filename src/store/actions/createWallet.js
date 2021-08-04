import { v4 as uuidv4 } from 'uuid'
import { encrypt } from '../../utils/crypto'
import buildConfig from '../../build.config'
import { accountCreator, getNextAccountColor } from '@/utils/accounts'
import { chains, assets as cryptoassets } from '@liquality/cryptoassets'
import { getLegacyRskBalance } from '../utils'

export const createWallet = async ({ state, commit, dispatch }, { key, mnemonic }) => {
  const id = uuidv4()
  const at = Date.now()
  const name = 'Account 1'
  const wallet = { id, name, mnemonic, at, imported: false }
  const { networks, defaultAssets } = buildConfig
  const { encrypted: encryptedWallets, keySalt } = await encrypt(
    JSON.stringify([wallet]),
    key
  )
  
  const balance = await getLegacyRskBalance(state.accounts)  
    
  commit('CREATE_WALLET', { keySalt, encryptedWallets, wallet, rskLegacyDerivation: balance.isEqualTo(0) })
  commit('CHANGE_ACTIVE_WALLETID', { walletId: id })
  commit('ENABLE_ASSETS', { network: 'mainnet', walletId: id, assets: defaultAssets.mainnet })
  commit('ENABLE_ASSETS', { network: 'testnet', walletId: id, assets: defaultAssets.testnet })

  networks.forEach(network => {
    const assetKeys = defaultAssets[network]
    buildConfig.chains.forEach(async chainId => {
      const assets = assetKeys.filter(asset => {
        return cryptoassets[asset]?.chain === chainId
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
