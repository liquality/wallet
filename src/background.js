import store from './store'
import { prettyBalance } from './utils/coinFormatter'

let balanceInterval
const BALANCE_UPDATE_INTERVAL = 30000

store.subscribe(({ type, payload }, state) => {
  switch (type) {
    case 'CHANGE_ACTIVE_NETWORK':
      store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateMarketData', { network: state.activeNetwork })

      break

    case 'UNLOCK_WALLET':
      store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateMarketData', { network: state.activeNetwork })
      store.dispatch('checkPendingSwaps')

      if (!balanceInterval) {
        balanceInterval = setInterval(() => {
          store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
        }, BALANCE_UPDATE_INTERVAL)
      }

      break

    case 'NEW_TRASACTION':
      {
        const prettyAmount = prettyBalance(payload.transaction.amount, payload.transaction.from)

        browser.notifications.create({
          type: 'basic',
          title: `Sent ${prettyAmount} ${payload.transaction.from}`,
          message: `You've sent ${prettyAmount} ${payload.transaction.from} to ${payload.transaction.toAddress} (${payload.transaction.txHash})`,
          iconUrl: `./img/${payload.transaction.from.toLowerCase()}.png`
        })
      }

      break
  }
})
