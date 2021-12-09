export const getters = {
  ledgerBridgeReady (state) {
    const { ledgerBridgeTransportConnected, ledgerBridgeConnected } = state
    return ledgerBridgeTransportConnected && ledgerBridgeConnected
  }
}
