import { Core } from '@walletconnect/core'
import SignClient from '@walletconnect/sign-client'
import qs from 'qs'

const notify = ({ notificationId, options = {} }, callback) => {
  browser.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: './icons/512x512.png',
    requireInteraction: true,
    ...options
  })
  if (callback) {
    browser.notifications.onClicked.addListener((id) => {
      callback(id)
      browser.notifications.clear(id)
    })
  }
}

let _signClient = null
export const initializeSignClient = async ({ dispatch, commit }) => {
  const core = new Core({
    projectId: process.env.VUE_APP_WALLET_CONNECT_PROJECT_ID,
    relayUrl: process.env.VUE_APP_WALLET_CONNECT_RELAY_URL
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

  _signClient.on('session_proposal', async (session) => {
    console.log('session_proposal', session)
    commit('ADD_WALLET_CONNNECT_SESSION_PROPOSAL', { session })
    const notificationId = `session-proposal:${session.id}`
    notify(
      {
        notificationId,
        options: {
          title: 'Wallet Connect Session',
          message: 'You have a new session request'
        }
      },
      (id) => {
        if (id === notificationId) {
          dispatch('openWalletConnectTab', { session: id.replace('session-proposal:', '') })
        }
      }
    )
  })
  _signClient.on('session_event', (event) => {
    console.log('session_event', event)
  })
  _signClient.on('session_request', async (event) => {
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
  _signClient.on('session_ping', (event) => {
    console.log('session_ping', event)
  })
  _signClient.on('session_delete', (event) => {
    console.log('session_delete', event)
  })

  // TODO: check when these events are called and how to handle it inside the wallet data
  _signClient.core.pairing.events.on('pairing_delete', ({ id, topic }) => {
    console.log('pairing_delete', { id, topic })
  })
  _signClient.core.pairing.events.on('pairing_ping', ({ id, topic }) => {
    console.log('pairing_ping', { id, topic })
  })
  _signClient.core.pairing.events.on('pairing_expire', ({ id, topic }) => {
    console.log('pairing_expire', { id, topic })
  })
}

export const pairSignClient = async (_, { uri }) => {
  await _signClient.core.pairing.pair({ uri })
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
  const { topic, acknowledged } = await _signClient.approve(req)
  console.log('topic', topic)
  const received = await acknowledged()
  console.log('received', received)
  if (received && received.acknowledged) {
    commit('ADD_WALLET_CONNNECT_SESSION', { session: received })
    commit('REMOVE_WALLET_CONNNECT_SESSION_PROPOSAL', { id })
  }
}

export const removeSessionProposal = async ({ commit }, { id }) => {
  commit('REMOVE_WALLET_CONNNECT_SESSION_PROPOSAL', { id })
}

export const openWalletConnectTab = async (_, query = null) => {
  let url = browser.runtime.getURL('/index.html#/wallet-connect')
  if (query) {
    url = `${url}?${qs.stringify(query)}`
  }
  browser.tabs.create({
    url
  })
}
