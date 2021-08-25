import moment from '@/utils/moment'
import store from '@/store'

export const SEND_STATUS_STEP_MAP = {
  WAITING_FOR_CONFIRMATIONS: 0,
  SUCCESS: 1
}

export const SEND_STATUS_LABEL_MAP = {
  WAITING_FOR_CONFIRMATIONS: 'Pending',
  SUCCESS: 'Completed'
}

export function getStatusLabel (item) {
  if (item.type === 'SEND') {
    return SEND_STATUS_LABEL_MAP[item.status] || ''
  }
  if (item.type === 'SWAP') {
    const swapProvider = store.getters.swapProvider(item.network, item.provider)
    return swapProvider.statuses[item.status].label.replace('{from}', item.from).replace('{to}', item.to).replace('{bridgeAsset}', item.bridgeAsset || '') || ''
  }
}

export function getStep (item) {
  if (item.type === 'SEND') {
    return SEND_STATUS_STEP_MAP[item.status]
  }
  if (item.type === 'SWAP') {
    const swapProvider = store.getters.swapProvider(item.network, item.provider)
    return swapProvider.statuses[item.status].step
  }
}

export const ACTIVITY_FILTER_TYPES = {
  SWAP: {
    label: 'Swap',
    icon: 'swap'
  },
  SEND: {
    label: 'Send',
    icon: 'send'
  },
  RECEIVE: {
    label: 'Receive',
    icon: 'receive'
  }
}

export const ACTIVITY_STATUSES = {
  PENDING: {
    label: 'Pending',
    icon: 'pending'
  },
  COMPLETED: {
    label: 'Completed',
    icon: 'completed'
  },
  NEEDS_ATTENTION: {
    label: 'Needs Attention',
    icon: 'needs_attention'
  },
  REFUNDED: {
    label: 'Refunded',
    icon: 'refunded'
  }
}

export const SEND_STATUS_FILTER_MAP = {
  WAITING_FOR_CONFIRMATIONS: 'PENDING',
  SUCCESS: 'COMPLETED'
}

export const getItemIcon = (name) => {
  try {
    return require(`../assets/icons/${name.toLowerCase()}.svg?inline`)
  } catch (e) {
    return require('../assets/icons/blank_asset.svg?inline')
  }
}

export const applyActivityFilters = (activity, filters) => {
  const { types, statuses, dates } = filters
  let data = [...activity]
  if (types.length > 0) {
    data = data.filter(i => types.includes(i.type))
  }

  if (statuses.length > 0) {
    data = data.filter(i => {
      if (i.type === 'SWAP') {
        const swapProvider = store.getters.swapProvider(i.network, i.provider)
        return statuses.includes(swapProvider.statuses[i.status].filterStatus)
      }

      if (i.type === 'SEND') {
        return statuses.includes(SEND_STATUS_FILTER_MAP[i.status])
      }

      return true
    })
  }

  if (dates.start) {
    const filter = moment(dates.start)
    data = data.filter(i => {
      const start = moment(i.startTime)
      return filter >= start
    })
  }

  if (dates.end) {
    const filter = moment(dates.end)
    data = data.filter(i => {
      const end = moment(i.startTime)
      return filter <= end
    })
  }

  return data
}
