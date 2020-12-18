export const SWAP_STATUS_STEP_MAP = {
  QUOTE: 0,
  SECRET_READY: 0,
  INITIATED: 0,
  INITIATION_REPORTED: 0,
  INITIATION_CONFIRMED: 1,
  CONFIRM_COUNTER_PARTY_INITIATION: 1,
  READY_TO_CLAIM: 2,
  WAITING_FOR_CLAIM_CONFIRMATIONS: 2,
  WAITING_FOR_REFUND: 2,
  GET_REFUND: 2,
  WAITING_FOR_REFUND_CONFIRMATIONS: 2,
  REFUNDED: 3,
  SUCCESS: 3,
  READY_TO_SEND: 3
}

export const SWAP_STATUS_LABEL_MAP = {
  QUOTE: 'Locking {from}',
  SECRET_READY: 'Locking {from}',
  INITIATED: 'Locking {from}',
  INITIATION_REPORTED: 'Locking {from}',
  INITIATION_CONFIRMED: 'Locking {to}',
  CONFIRM_COUNTER_PARTY_INITIATION: 'Locking {to}',
  READY_TO_CLAIM: 'Claiming {to}',
  WAITING_FOR_CLAIM_CONFIRMATIONS: 'Claiming {to}',
  WAITING_FOR_REFUND: 'Pending Refund',
  GET_REFUND: 'Refunding {from}',
  WAITING_FOR_REFUND_CONFIRMATIONS: 'Refunding {from}',
  REFUNDED: 'Refunded',
  SUCCESS: 'Completed',
  READY_TO_SEND: 'Sending'
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
    return SEND_STATUS_LABEL_MAP[item.status]
  }
  if (item.type === 'SWAP') {
    return SWAP_STATUS_LABEL_MAP[item.status].replace('{from}', item.from).replace('{to}', item.to)
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

export const ACTIVITY_FILTER_STATUSES = {
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
  },
  CANCELED: {
    label: 'Canceled',
    icon: 'canceled'
  }
}

export const SEND_STATUS_FILTER_MAP = {
  WAITING_FOR_CONFIRMATIONS: 'PENDING',
  SUCCESS: 'COMPLETED'
}

export const SWAP_STATUS_FILTER_MAP = {
  QUOTE: 'PENDING',
  SECRET_READY: 'PENDING',
  INITIATED: 'PENDING',
  INITIATION_REPORTED: 'PENDING',
  INITIATION_CONFIRMED: 'PENDING',
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
