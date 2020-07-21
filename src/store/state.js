// addresses.network.walletId.asset
// balances.network.walletId.asset
// history.network.walletId[]
// marketData.network

export default {
  // <do not keep these in localStorage>
  key: null,
  wallets: [],
  unlockedAt: null,
  // </do not keep these in localStorage>

  brokerReady: true,

  encryptedWallets: null,
  addresses: {},
  balances: {},
  fees: {},
  history: {},
  marketData: {},

  activeNetwork: 'testnet',
  activeWalletId: null,
  activeAsset: null,

  keyUpdatedAt: null,
  termsAcceptedAt: null,
  setupAt: null
}
