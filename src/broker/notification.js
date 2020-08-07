import { prettyBalance } from '../utils/coinFormatter'

const SWAP_STATUS_MAP = {
  INITIATION_REPORTED () {
    return 'Swap initiated'
  },
  WAITING_FOR_CONFIRMATIONS (item) {
    return `Counterparty sent ${prettyBalance(item.toAmount, item.to)} ${item.to} to escrow`
  },
  READY_TO_CLAIM () {
    return 'Claiming funds'
  },
  SUCCESS (item) {
    return `Swap completed, ${prettyBalance(item.toAmount, item.to)} ${item.to} ready to use`
  },
  REFUNDED (item) {
    return `Swap refunded, ${prettyBalance(item.fromAmount, item.from)} ${item.from} returned`
  }
}

export const createNotification = config => browser.notifications.create({
  type: 'basic',
  iconUrl: './icons/512x512.png',
  ...config
})

export const createSwapNotification = item => {
  const fn = SWAP_STATUS_MAP[item.status]
  if (!fn) return

  return createNotification({
    title: `${item.from} -> ${item.to}`,
    message: fn(item)
  })
}
