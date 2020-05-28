import store from './store'
import { prettyBalance } from './utils/coinFormatter'

store.subscribe(({ type, payload }, state) => {
  switch (type) {
    case 'UNLOCK_WALLET':
      store.dispatch('updateMarketData', { network: 'testnet' })
      store.dispatch('updateBalances', { network: 'testnet', walletId: 'demo' })
      store.dispatch('getUnusedAddresses', { network: 'testnet', walletId: 'demo', assets: ['BTC', 'ETH'] })

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
