export const removeUseLedgerLive = { // remove useLedgerLive
  version: 8,
  migrate: async (state) => {
    delete state.useLedgerLive
    return { ...state, usbBridgeWindowsId: 0 }
  }
}
