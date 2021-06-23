import {
  callToBridge
} from '@/utils/ledger-bridge-provider'

export const sendMessageToLedgerBridge = async ({ state, commit, getters }, { method, callType, payload, app }) => {
  return callToBridge({ app, method, callType, payload })
}
