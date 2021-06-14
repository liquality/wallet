import {
  callToBridge
} from '@/utils/ledger-bridge-provider'

export const setUseLedgerLive = async ({ dispatch, commit }, { use }) => {
  await callToBridge({
    method: 'UPDATE-TRANSPORT-PREFERENCE',
    callType: 'ASYNC',
    payload: { useLedgerLive: use },
    app: 'SETTINGS'
  })
  commit('SET_USE_LEDGER_LIVE', { use })
}
