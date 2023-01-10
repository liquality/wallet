import { Core } from '@walletconnect/core'
import SignClient from '@walletconnect/sign-client'

let _signClient = null
export const getSignClient = async () => {
  if (!_signClient) {
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

    _signClient = await SignClient.init({
      core,
      metadata
    })
  }

  return _signClient
}
