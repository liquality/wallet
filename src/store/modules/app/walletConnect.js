import { getSignClient } from '@/utils/wallet-connect'
import { getSdkError } from '@walletconnect/utils'
import { notify } from '@/utils/notification'
import { DappProviderFactory } from '@/dapps/DappProviderFactory'
import qs from 'qs'
import { getChainInfo } from '@/utils/chains'
let clientInitialized = false

export const initializeSignClient = async ({ commit, state, dispatch, rootGetters }) => {
  const signClient = await getSignClient()
  if (!clientInitialized) {
    signClient.on('session_proposal', async ({ id, params }) => {
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

    signClient.on('session_event', (event) => {
      console.log('session_event', event)
    })

    signClient.on('session_request', async ({ id, topic, params }) => {
      console.log('session_request', { id, topic, params })
      commit('ADD_SESSION_REQUEST', { id, topic, params })
    })

    signClient.on('session_ping', ({ id, topic }) => {
      console.log('WalletConnect: session_ping', { id, topic })
    })

    signClient.on('session_delete', ({ id, topic }) => {
      console.log('WalletConnect: session_delete', { id, topic })
      dispatch('getSessions')
    })

    // TODO: check when these events are called and how to handle it inside the wallet data
    signClient.core.pairing.events.on('pairing_delete', ({ id, topic }) => {
      console.log('pairing_delete', { id, topic })
      dispatch('getPairings')
    })
    signClient.core.pairing.events.on('pairing_ping', ({ id, topic }) => {
      console.log('pairing_ping', { id, topic })
    })
    signClient.core.pairing.events.on('pairing_expire', ({ id, topic }) => {
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
  const signClient = await getSignClient()
  const pairings = signClient.core.pairing.getPairings()?.filter((p) => p.active) || []
  console.log('existing pairings', pairings)
  commit('SET_PAIRINGS', { pairings })
}

export const pairSignClient = async ({ dispatch }, { uri }) => {
  const signClient = await getSignClient()
  await signClient.core.pairing.pair({ uri })
  dispatch('getPairings')
}

export const getSessionProposals = async ({ commit }) => {
  const signClient = await getSignClient()
  const proposals = signClient.proposal.getAll()
  console.log('propsals', proposals)
  commit('SET_SESSION_PROPOSALS', { proposals })
}

export const getSessions = async ({ commit }) => {
  const signClient = await getSignClient()
  const sessions = signClient.session.getAll()
  console.log('sessions', sessions)
  commit('SET_SESSIONS', { sessions })
}

export const approveSession = async ({ dispatch }, { proposal, accounts }) => {
  console.log('approveSession', { proposal, accounts })
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
  const signClient = await getSignClient()
  const { topic, acknowledged } = await signClient.approve(req)
  console.log('topic', topic)
  const session = await acknowledged()
  console.log('approvedSession', session)
  await dispatch('getPairings')
  await dispatch('getSessions')
  await dispatch('getSessionProposals')
  return session && session.acknowledged
}

export const rejectSession = async (_, { session }) => {
  const signClient = await getSignClient()
  const { id } = session
  await signClient.reject({
    id,
    reason: {
      code: 1,
      message: 'rejected'
    }
  })
}

export const removeSessionProposal = async (_, { topic }) => {
  const signClient = await getSignClient()
  return signClient.proposal.delete(topic)
}

export const removeSession = async ({ dispatch }, { topic }) => {
  console.log('remove sessions called')
  const signClient = await getSignClient()
  const result = signClient.session.delete(topic)
  dispatch('getPairings')
  dispatch('getSessions')
  return result
}

export const removePairing = async ({ dispatch }, { topic }) => {
  console.log('removePairing called')
  const signClient = await getSignClient()
  const result = signClient.core.pairing.disconnect({ topic })
  dispatch('getPairings')
  return result
}

export const getAccountInfo = ({ rootState, state }, { chainId }) => {
  try {
    const { accounts } = rootState
    const { wcSessions } = state
    // Validate namespace / chainId with network => eip155:5
    const chanIdData = chainId.split(':')
    const namespace = chanIdData[0]
    const { namespaces } = wcSessions.find((s) => s.namespaces[namespace] && s.topic === topic)
    const wcAccounts = namespaces[namespace]?.accounts?.map((a) => a.replace(`${chainId}:`, ''))

    // Validate with chainId map ex: eip155 => ethereum / 5 => testnet
    const chainInfo = getChainInfo(namespace, chanIdData[1])
    const account = accounts[chainInfo?.networkName]?.find(
      (a) => a.chain === chainInfo?.name && wcAccounts.some((r) => a.addresses.includes(r))
    )

    return account
  } catch (err) {
    console.error(err)
    return null
  }
}

export const respondSessionRequest = async ({ }, { params, accept }) => {
  const signClient = await getSignClient()
  const { id, topic, params } = payload

  if (accept === true) {
    const account = await dispatch('getAccountInfo', { chainId: params.chainId })
    if (account) {
      const provider = DappProviderFactory.resolve({ chainId: params.chainId })
      const providerResponse = await provider.handleRequest({
        ...params.request,
        chainId: params.chainId,
        accountId: account?.id
      })

      const response = { id, jsonrpc: '2.0' }
      if (providerResponse.error) {
        response.error = error
      } else if (providerResponse.result) {
        response.result = result
      }

      await signClient.respond({ topic, response })
      console.log(`session_request => response: ${response} / accept: ${accept}`)
      await (await signClient.extend({ topic })).acknowledged()
    } else {
      // account related not found
      await signClient.respond({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          error: getSdkError('UNSUPPORTED_ACCOUNTS')
        }
      })
    }

  } else {
    // user not accepted the session request
    const response = {
      id,
      jsonrpc: '2.0',
      error: getSdkError('USER_REJECTED')
    }
    await signClient.respond({
      topic,
      response
    })
    console.log('session_request => USER_REJECTED')
  }
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

export const removeConnection = async ({ dispatch }, { connection }) => {
  const { sessions, pairings } = connection

  const sessionsRemovalTasks = sessions.map(({ topic }) => dispatch('removeSession', { topic }))
  const pairingsRemovalRes = pairings.map(({ topic }) => dispatch('removePairing', { topic }))

  await Promise.all([...sessionsRemovalTasks, ...pairingsRemovalRes])
}
