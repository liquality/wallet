import { getWeb3Wallet } from '@/utils/wallet-connect'
import { getSdkError } from '@walletconnect/utils'
import { notify } from '@/utils/notification'
import { DappProviderFactory } from '@/dapps/DappProviderFactory'
import qs from 'qs'

let clientInitialized = false
const dappProviderFactory = new DappProviderFactory()

export const initializeSignClient = async ({ state, dispatch }) => {
  const web3wallet = await getWeb3Wallet()
  if (!clientInitialized) {
    web3wallet.on('session_proposal', async ({ id, params }) => {
      console.log('session_proposal', { id, params })
      dispatch('getSessionProposals')
      const notificationId = `session-proposal:${params.pairingTopic}`
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
            if (state.app.extensionIsOpen === true) {
              //dispatch('showWalletNotification')
            } else {
              dispatch('openWalletConnectTab', { session: id.replace('session-proposal:', '') })
            }
          }
        }
      )
    })
    web3wallet.on('session_event', (event) => {
      console.log('session_event', event)
    })
    web3wallet.on('session_request', async ({ id, topic, params }) => {
      console.log('session_request', { id, topic, params })
      const { chainId, request } = params

      const provider = dappProviderFactory.resolve(chainId)
      const result = provider.handleRequest(request)
      console.log('session_request => result', result)
    })
    web3wallet.on('session_ping', ({ id, topic }) => {
      console.log('WalletConnect: session_ping', { id, topic })
    })
    web3wallet.on('session_delete', ({ id, topic }) => {
      console.log('WalletConnect: session_delete', { id, topic })
      dispatch('getSessions')
    })

    // TODO: check when these events are called and how to handle it inside the wallet data
    web3wallet.core.pairing.events.on('pairing_delete', ({ id, topic }) => {
      console.log('pairing_delete', { id, topic })
      dispatch('getPairings')
    })
    web3wallet.core.pairing.events.on('pairing_ping', ({ id, topic }) => {
      console.log('pairing_ping', { id, topic })
    })
    web3wallet.core.pairing.events.on('pairing_expire', ({ id, topic }) => {
      console.log('pairing_expire', { id, topic })
      dispatch('getPairings')
    })
    clientInitialized = true
  }
  //initialize data
  dispatch('getPairings')
  dispatch('getSessions')
  dispatch('getSessionProposals')
}

export const getPairings = async ({ commit }) => {
  const web3wallet = await getWeb3Wallet()
  const pairings = web3wallet.core.pairing.getPairings()
  console.log('existing pairings', pairings)
  commit('SET_PAIRINGS', { pairings })
}
export const pairSignClient = async (_, { uri }) => {
  const web3wallet = await getWeb3Wallet()
  await web3wallet.core.pairing.pair({ uri })
}

export const getSessionProposals = async ({ commit }) => {
  const web3wallet = await getWeb3Wallet()
  const propsals = web3wallet.getPendingSessionProposals()
  console.log('propsals', propsals)
  commit('SET_SESSION_PROPOSALS', { propsals })
}

export const getSessions = async ({ commit }) => {
  const web3wallet = await getWeb3Wallet()
  const sessions = web3wallet.getActiveSessions()
  console.log('sessions', sessions)
  commit('SET_SESSIONS', { sessions })
}

export const approveSession = async ({ dispatch }, { proposal, accounts }) => {
  console.log('approveSession', proposal)
  const { id, requiredNamespaces } = proposal
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
  const web3wallet = await getWeb3Wallet()
  const approvedSession = await web3wallet.approveSession(req)

  console.log('approvedSession', approvedSession)
  dispatch('getPairings')
  dispatch('getSessions')
  dispatch('getSessionProposals')
  return approvedSession
}

export const rejectSession = async (_, { propsal }) => {
  const web3wallet = await getWeb3Wallet()
  const { id } = propsal
  await web3wallet.rejectSession({
    id,
    reason: getSdkError('USER_REJECTED_METHODS')
  })
  // TODO: maybe we need to call to remove proposal
  // commit('REMOVE_WALLET_CONNNECT_SESSION_PROPOSAL', { topic: pairingTopic })
}

export const removeSessionProposal = async (_, { topic }) => {
  const web3wallet = await getWeb3Wallet()
  return web3wallet.proposal.delete(topic)
}

export const removeSession = async ({ dispatch }, { topic }) => {
  const web3wallet = await getWeb3Wallet()
  const result = web3wallet.disconnectSession({ topic, reason: getSdkError('USER_DISCONNECTED') })
  dispatch('getPairings')
  dispatch('getSessions')
  return result
}

export const removePairing = async ({ dispatch }, { topic }) => {
  const web3wallet = await getWeb3Wallet()
  const result = web3wallet.core.pairing.disconnect({ topic })
  dispatch('getPairings')
  return result
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
