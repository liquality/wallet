import store from '../store'
import { createNotification } from '../broker/notification'

class SwapProvider {
  constructor (config) {
    if (this.constructor === SwapProvider) {
      throw new TypeError('Abstract class "SwapProvider" cannot be instantiated directly.')
    }
    this.config = config
  }

  async sendLedgerNotification (accountId, message) {
    const account = store.getters.accountItem(accountId)
    if (account?.type.includes('ledger')) {
      const notificationId = await createNotification({
        title: 'Sign with Ledger',
        message
      })
      const listener = (_id) => {
        if (_id === notificationId) {
          browser.notifications.clear(_id)
          browser.notifications.onClicked.removeListener(listener)
        }
      }
      browser.notifications.onClicked.addListener(listener)
    }
  }

  /**
   * Get the supported pairs of this provider for this network
   * @param {{ network }} network
   */
  getSupportedPairs ({ network }) {
    throw new Error('`getSupportedPairs` not implemented')
  }

  /**
   * Get a quote for the specified parameters
   * @param {{ network, from, to, amount }} options
   */
  getQuote ({ network, from, to, amount }) {
    throw new Error('`getQuote` not implemented')
  }

  /**
   * Create a new swap for the given quote
   * @param {{ network, walletId, quote }} options
   */
  newSwap ({ network, walletId, quote }) {
    throw new Error('`newSwap` not implemented')
  }

  /**
   * Estimate the fees for the given parameters
   * @param {{ network, walletId, asset, fromAccountId, toAccountId, txType, amount, feePrices[], max }} options
   * @return Object of key feePrice and value fee
   */
  async estimateFees ({ network, walletId, asset, txType, quote, feePrices, max }) {
    throw new Error('`estimateFee` not implemented')
  }

  /**
   * This hook is called when state updates are required
   * @param {object} store
   * @param {{ network, walletId, swap }}
   * @return updates An object representing updates to the current swap in the history
   */
  async performNextSwapAction (store, { network, walletId, swap }) {
    throw new Error('`newSwap` not implemented')
  }

  /**
   * Get market data
   * @param {string} network
   * @return account
   */
  getMarketData (network) {
    return store.state.marketData[network]
  }

  /**
   * Get blockchain client
   */
  getClient (network, walletId, asset, accountId) {
    return store.getters.client(
      {
        network,
        walletId,
        asset,
        accountId
      }
    )
  }

  /**
   * Get account by id
   * @param {string} accountId
   * @return account
   */
  getAccount (accountId) {
    return store.getters.accountItem(accountId)
  }

  /**
   * Update balances for given assets
   * @param {string} network
   * @param {string} walletId
   * @param {string[]} assets
   */
  async updateBalances (network, walletId, assets) {
    return store.dispatch('updateBalances', { network, walletId, assets })
  }

  /**
   * Get an address to use for the swap
   * @param {string} network
   * @param {string} walletId
   * @param {string} asset
   * @param {string} accountId
   * @returns string address
   */
  async getSwapAddress (network, walletId, asset, accountId) {
    const [address] = await store.dispatch('getUnusedAddresses', { network, walletId, assets: [asset], accountId })
    return address
  }

  get statuses () {
    const statuses = this.constructor.statuses
    if (typeof statuses === 'undefined') throw new Error('`statuses` is not defined. Shape: { STATUS: { step: number, label: string, filterStatus: string, notification () : ({ message }) } }')
    return statuses
  }

  get fromTxType () {
    const fromTxType = this.constructor.fromTxType
    if (typeof fromTxType === 'undefined') throw new Error('`fromTxType` is not defined. e.g. "INITIATE"')
    return fromTxType
  }

  get toTxType () {
    const toTxType = this.constructor.toTxType
    if (typeof toTxType === 'undefined') throw new Error('`toTxType` is not defined. e.g. "REDEEM"')
    return toTxType
  }

  get timelineDiagramSteps () {
    const timelineDiagramSteps = this.constructor.timelineDiagramSteps
    if (typeof timelineDiagramSteps === 'undefined') throw new Error('`timelineDiagramSteps` is not defined. e.g. ["APPROVE","SWAP"]')
    return timelineDiagramSteps
  }

  get totalSteps () {
    const totalSteps = this.constructor.totalSteps
    if (typeof totalSteps === 'undefined') throw new Error('`totalSteps` is not defined. e.g. 2')
    return totalSteps
  }
}

export { SwapProvider }
