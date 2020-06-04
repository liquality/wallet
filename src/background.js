import store from './store'
import { prettyBalance } from './utils/coinFormatter'

store.subscribe(({ type, payload }, state) => {
  switch (type) {
    case 'UPDATE_HISTORY':
      if (payload.id) {
        browser.notifications.create({
          type: 'basic',
          title: payload.updates.status,
          message: payload.id,
          iconUrl: './icons/512x512.png'
        })
      }

      break

    case 'CHANGE_ACTIVE_NETWORK':
      store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })

      break

    case 'UNLOCK_WALLET':
      store.dispatch('updateBalances', { network: state.activeNetwork, walletId: state.activeWalletId })
      store.dispatch('updateMarketData', { network: state.activeNetwork })
      store.dispatch('checkPendingSwaps')

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
