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
  signClient.on('session_proposal', async (session) => {
    console.log('session_proposal', session)
    commit('ADD_WALLET_CONNNECT_SESSION_PROPOSAL', { session })
  })
  signClient.on('session_event', (event) => {
    console.log('session_event', event)
  })
  signClient.on('session_request', async (event) => {
    console.log('session_request', event)
    //const { id, params, topic } = event
    // const { request } = params
    commit('ADD_WALLET_CONNNECT_REQUEST', { request: event })
    // if (request.method === 'eth_sendTransaction') {
    //   // await dispatch('sendTransaction', {
    //   //     network: rootState.activeNetwork,
    //   //     walletId: rootState.activeWalletId,
    //   //     asset: 'ETH',
    //   //     to: params.to,
    //   //     accountId: this.account.id,
    //   //     amount,
    //   //     fee,
    //   //     gas: cryptoassets[this.asset].sendGasLimit,
    //   //     feeLabel: this.selectedFee,
    //   //     fiatRate: this.fiatRates[this.asset],
    //   //     ...(this.showMemoInput && { data: this.memoData })
    //   //   })
    // }
  })
  signClient.on('session_ping', (event) => {
    console.log('session_ping', event)
  })
}

export const pairSignClient = async (_, { uri }) => {
  await signClient.pair({ uri })
}

export const approveSession = async ({ commit }, { session, accounts }) => {
    console.log('approveSession', { session, accounts })
  const { id, params } = session
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
  const received = await acknowledged()
  console.log('session', topic)
  console.log('session', received)
  commit('REMOVE_WALLET_CONNNECT_SESSION_PROPOSAL', { id })
  commit('ADD_WALLET_CONNNECT_SESSION', { session })
}
