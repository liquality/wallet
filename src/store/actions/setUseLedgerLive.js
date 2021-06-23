import {
  callToBridge
} from '@/utils/ledger-bridge-provider'

export const setUseLedgerLive = async ({ state, commit }, { use }) => {
  const { activeNetwork } = state
  await callToBridge({
    network: activeNetwork,
    app: 'SETTINGS',
    method: 'UPDATE-TRANSPORT-PREFERENCE',
    callType: 'ASYNC',
    payload: { useLedgerLive: use }
  })
  commit('SET_USE_LEDGER_LIVE', { use })
}
