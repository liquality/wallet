import { encrypt, decrypt, decryptLegacy } from '../../utils/crypto'
import { Client } from '@liquality/client'
import { EthereumRpcProvider } from '@liquality/ethereum-rpc-provider'

export const unlockWallet = async ({ commit, state, dispatch }, { key }) => {
  let wallets = await decrypt(state.encryptedWallets, key, state.keySalt)

  const accKeys = Object.keys(state.accounts);

  let addresses = [];

  for(let i = 0; i < accKeys.length; i++) {
    const currentAccs = currentState.accounts[accKeys[i]].mainnet;
    
    for(let k = 0; k < currentAccs.length; k++) {
      if(currentAccs[k].chain === 'rsk') {
        addresses.push(...currentAccs[k].addresses)
      }
    }
  }

  const client = new Client()
    .addProvider(
      new EthereumRpcProvider({ uri: 'https://public-node.rsk.co' })
    );
  
  const balance = await client._chain.getBalance(addresses)
  
  // Migration to new encryption method
  // TODO: to be removed
  if (!wallets) {
    wallets = await decryptLegacy(state.encryptedWallets, key)
    if (wallets) {
      const { encrypted: encryptedWallets, keySalt } = await encrypt(wallets, key)
      commit('CREATE_WALLET', { keySalt, encryptedWallets, wallet: JSON.parse(wallets)[0], rskLegacyDerivation: !balance.toNumber() })
    }
  }
  // Migration to new encryption method

  if (!wallets) {
    throw new Error(
      'Try Again. Enter the right password (it has 8 or more characters).'
    )
  }

  commit('UNLOCK_WALLET', {
    key,
    wallets: JSON.parse(wallets),
    unlockedAt: Date.now(),
    rskLegacyDerivation: !balance.toNumber()
  })
}
