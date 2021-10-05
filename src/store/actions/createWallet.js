import { v4 as uuidv4 } from 'uuid'
import { encrypt } from '../../utils/crypto'
import buildConfig from '../../build.config'
import { accountCreator, getNextAccountColor } from '@/utils/accounts'
import { ChainId, chains, assets as cryptoassets } from '@liquality/cryptoassets'

export const createWallet = async ({ state, commit, dispatch }, { key, mnemonic, imported = false }) => {
  const id = uuidv4()
  const at = Date.now()
  const name = 'Account 1'
  const wallet = { id, name, mnemonic, at, imported }
  const { networks, defaultAssets } = buildConfig
  const { encrypted: encryptedWallets, keySalt } = await encrypt(
    JSON.stringify([wallet]),
    key
  )

  commit('CREATE_WALLET', { keySalt, encryptedWallets, wallet })
  commit('CHANGE_ACTIVE_WALLETID', { walletId: id })
  commit('ENABLE_ASSETS', { network: 'mainnet', walletId: id, assets: defaultAssets.mainnet })
  commit('ENABLE_ASSETS', { network: 'testnet', walletId: id, assets: defaultAssets.testnet })

  networks.forEach(network => {
    const assetKeys = defaultAssets[network]
    buildConfig.chains.forEach(async chainId => {
      commit('TOGGLE_BLOCKCHAIN', { network, walletId: id, chainId, enable: true })
      const assets = assetKeys.filter(asset => {
        return cryptoassets[asset]?.chain === chainId
      })

      const chain = chains[chainId]
      const _account = accountCreator(
        {
          walletId: id,
          network,
          account: {
            name: `${chain.name} 1`,
            alias: '',
            chain: chainId,
            addresses: [],
            assets,
            balances: {},
            type: 'default',
            index: 0,
            color: getNextAccountColor(chainId, 0),
            enabled: true
          }
        })

      commit('CREATE_ACCOUNT', { network, walletId: id, account: _account })

      // for RSK we add an extra account for legacy derivation path
      if (imported && chainId === ChainId.Rootstock) {
        // get the legacy rsk derivation path
        const coinType = network === 'mainnet' ? '137' : '37310'
        const chain = chains[ChainId.Rootstock]
        const _account = accountCreator({
          walletId: id,
          network,
          account: {
            name: `Legacy ${chain.name} 1`,
            alias: '',
            chain: ChainId.Rootstock,
            addresses: [],
            assets,
            balances: {},
            type: 'default',
            index: 0,
            derivationPath: `m/44'/${coinType}'/0'/0/0`,
            color: getNextAccountColor(ChainId.Rootstock, 1),
            enabled: true
          }
        })
        commit('CREATE_ACCOUNT', { network, walletId: id, account: _account })
      }
    })
  })

  return wallet
}
