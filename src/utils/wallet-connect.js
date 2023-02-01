import { Core } from '@walletconnect/core'
import { Web3Wallet } from '@walletconnect/web3wallet'

let _web3Wallet = null
export const getWeb3Wallet = async () => {
  if (!_web3Wallet) {
    const core = new Core({
      projectId: process.env.VUE_APP_WALLET_CONNECT_PROJECT_ID,
      relayUrl: 'wss://relay.walletconnect.com'
    })
    const metadata = {
      name: 'Liquality',
      description: 'One Wallet all Chains',
      url: 'https://liquality.io',
      icons: [
        'https://assets.website-files.com/61ae51cb7959d04801e85bc7/61ae51cb7959d04127e85c52_Liquality_logo.svg'
      ]
    }

    _web3Wallet = await Web3Wallet.init({
      core,
      metadata
    })
  }

  return _web3Wallet
}
