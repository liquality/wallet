import moment from '@/utils/moment'

export const SWAP_STATUS_STEP_MAP = {
  INITIATED: 0,
  INITIATION_REPORTED: 0,
  INITIATION_CONFIRMED: 0,
  FUNDED: 1,
  CONFIRM_COUNTER_PARTY_INITIATION: 1,
  READY_TO_CLAIM: 2,
  WAITING_FOR_CLAIM_CONFIRMATIONS: 2,
  WAITING_FOR_REFUND: 2,
  GET_REFUND: 2,
  WAITING_FOR_REFUND_CONFIRMATIONS: 2,
  REFUNDED: 3,
  SUCCESS: 3,
  QUOTE_EXPIRED: 3,
  READY_TO_SEND: 3
}

export const SWAP_STATUS_LABEL_MAP = {
  INITIATED: 'Locking {from}',
  INITIATION_REPORTED: 'Locking {from}',
  INITIATION_CONFIRMED: 'Locking {from}',
  FUNDED: 'Locking {to}',
  CONFIRM_COUNTER_PARTY_INITIATION: 'Locking {to}',
  READY_TO_CLAIM: 'Claiming {to}',
  WAITING_FOR_CLAIM_CONFIRMATIONS: 'Claiming {to}',
  WAITING_FOR_REFUND: 'Pending Refund',
  GET_REFUND: 'Refunding {from}',
  WAITING_FOR_REFUND_CONFIRMATIONS: 'Refunding {from}',
  REFUNDED: 'Refunded',
  SUCCESS: 'Completed',
  READY_TO_SEND: 'Sending',
  QUOTE_EXPIRED: 'Quote Expired {from}'
}

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
    return SWAP_STATUS_LABEL_MAP[item.status]?.replace('{from}', item.from)?.replace('{to}', item.to) || ''
  }
}

export function getStep (item) {
  if (item.type === 'SEND') {
    return SEND_STATUS_STEP_MAP[item.status]
  }
  if (item.type === 'SWAP') {
    return SWAP_STATUS_STEP_MAP[item.status]
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

export const SWAP_STATUS_FILTER_MAP = {
  INITIATED: 'PENDING',
  INITIATION_REPORTED: 'PENDING',
  INITIATION_CONFIRMED: 'PENDING',
  FUNDED: 'PENDING',
  CONFIRM_COUNTER_PARTY_INITIATION: 'PENDING',
  READY_TO_CLAIM: 'PENDING',
  WAITING_FOR_CLAIM_CONFIRMATIONS: 'PENDING',
  WAITING_FOR_REFUND: 'NEEDS_ATTENTION',
  GET_REFUND: 'NEEDS_ATTENTION',
  WAITING_FOR_REFUND_CONFIRMATIONS: 'NEEDS_ATTENTION',
  REFUNDED: 'REFUNDED',
  SUCCESS: 'COMPLETED',
  READY_TO_SEND: 'PENDING'
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
        return statuses.includes(SWAP_STATUS_FILTER_MAP[i.status])
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
