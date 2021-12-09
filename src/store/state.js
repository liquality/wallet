// addresses.network.walletId.asset
// balances.network.walletId.asset
// history.network.walletId[]
// marketData.network
import { LATEST_VERSION } from './migrations'

export default {
  version: LATEST_VERSION,

  // <do not keep these in localStorage>
  key: null,
  wallets: [],
  unlockedAt: null,
  // </do not keep these in localStorage>

  brokerReady: true,

  encryptedWallets: null,

  enabledAssets: {},
  customTokens: {},

  accounts: {},

  fiatRates: {},
  fees: {},
  history: {},
  marketData: {},

  activeNetwork: 'mainnet',
  activeWalletId: null,
  activeAsset: null,

  keyUpdatedAt: null,
  keySalt: null,
  termsAcceptedAt: null,
  setupAt: null,

  injectEthereum: false,
  injectEthereumChain: 'ethereum',
  usbBridgeWindowsId: 0,

  externalConnections: {},
  rskLegacyDerivation: false,
  analytics: {
    userId: null,
    acceptedDate: null,
    askedDate: null,
    askedTimes: 0,
    notAskAgain: false
  },
  experiments: {},
  watsNewModalVersion: null,
  enabledChains: {}
}
