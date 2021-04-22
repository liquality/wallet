import {
  setupBridgeIframe
} from '@/utils/ledger-bridge-provider'

export const setupLedgerBridge = async () => {
  const url = process.env.VUE_APP_LEDGER_BRIDGE_URL
  setupBridgeIframe(url)
}
