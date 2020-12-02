/* global browser */

import { prettyBalance } from '../utils/coinFormatter'
import { getAssetIcon } from '../utils/asset'

const SWAP_STATUS_MAP = {
  INITIATION_REPORTED () {
    return {
      message: 'Swap initiated'
    }
  },
  CONFIRM_COUNTER_PARTY_INITIATION (item) {
    return {
      message: `Counterparty sent ${prettyBalance(item.toAmount, item.to)} ${item.to} to escrow`
    }
  },
  READY_TO_CLAIM () {
    return {
      message: 'Claiming funds'
    }
  },
  SUCCESS (item) {
    return {
      message: `Swap completed, ${prettyBalance(item.toAmount, item.to)} ${item.to} ready to use`
    }
  },
  REFUNDED (item) {
    return {
      message: `Swap refunded, ${prettyBalance(item.fromAmount, item.from)} ${item.from} returned`
    }
  }
}

const SEND_STATUS_MAP = {
  WAITING_FOR_CONFIRMATIONS (item) {
    return {
      title: `New ${item.from} Transaction`,
      message: `Sending ${prettyBalance(item.amount, item.from)} ${item.from} to ${item.toAddress}`
    }
  },
  SUCCESS (item) {
    return {
      title: `${item.from} Transaction Confirmed`,
      message: `Sent ${prettyBalance(item.amount, item.from)} ${item.from} to ${item.toAddress}`
    }
  }
}

export const createNotification = config => browser.notifications.create({
  type: 'basic',
  iconUrl: './icons/512x512.png',
  ...config
})

const createSwapNotification = item => {
  if (!(item.status in SWAP_STATUS_MAP)) return
  const notification = SWAP_STATUS_MAP[item.status](item)

  return createNotification({
    title: `${item.from} -> ${item.to}`,
    ...notification
  })
}

const createSendNotification = item => {
  if (!(item.status in SEND_STATUS_MAP)) return
  const notification = SEND_STATUS_MAP[item.status](item)

  return createNotification({
    iconUrl: getAssetIcon(item.from),
    ...notification
  })
}

export const createHistoryNotification = item => {
  if (item.type === 'SEND') return createSendNotification(item)
  else if (item.type === 'SWAP') return createSwapNotification(item)
}
