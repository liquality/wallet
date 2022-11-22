import SignClient from '@walletconnect/sign-client'

let signClient
export const initializeSignClient = async ({ commit }) => {
  signClient = await SignClient.init({
    projectId: process.env.VUE_APP_WALLET_CONNECT_PROJECT_ID,
    relayUrl: process.env.VUE_APP_WALLET_CONNECT_RELAY_URL,
    metadata: {
      name: 'Liquality',
      description: 'One Wallet all Chains',
      url: 'https://liquality.io',
      icons: [
        'https://assets.website-files.com/61ae51cb7959d04801e85bc7/61ae51cb7959d04127e85c52_Liquality_logo.svg'
      ]
    }
  })
  signClient.on('session_proposal', async (event) => {
    console.log('session_proposal', event)
    commit('ADD_WALLET_CONNNECT_SESSION', event)
  })
  signClient.on('session_event', (event) => {
    console.log('session_event', event)
  })
  signClient.on('session_request', (event) => {
    console.log('session_request', event)
    commit('ADD_WALLET_CONNNECT_REQUEST', event)
  })
  signClient.on('session_ping', (event) => {
    console.log('session_ping', event)
  })
}

export const pairSignClient = async (_, { uri }) => {
  await signClient.pair({ uri })
}

export const approveSession = async ({ state, commit }, { id, accounts }) => {
  if (!state.wcSessions[id]) {
    return false
  }

  const { params } = state.wcSession[id]
  const { requiredNamespaces } = params
  const { eip155 } = requiredNamespaces
  const { chains, methods, events } = eip155
  // Approve session proposal, use id from session proposal event and respond with namespace(s) that satisfy dapps request and contain approved accounts
  const req = {
    id,
    namespaces: {
      eip155: {
        accounts: accounts.map((a) => `${chains[0]}:${a}`),
        methods,
        events
      }
    }
  }
  console.log('req', req)
  const { topic, acknowledged } = await signClient.approve(req)
  console.log('topic', topic)
  // Optionally await acknowledgement from dapp
  const session = await acknowledged()
  console.log('session', topic)
  console.log('session', session)
  if (session) {
    commit('REMOVE_WALLET_CONNNECT_SESSION', { id })
    return true
  }
  return false
}
