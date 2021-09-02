export const useLedgerLiveDefault = { // set useLedgerLive default to false
  version: 6,
  migrate: async (state) => {
    return { ...state, useLedgerLive: false }
  }
}
