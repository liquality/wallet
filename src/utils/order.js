export const ORDER_STATUS_STEP_MAP = {
  QUOTE: 0,
  SECRET_READY: 0,
  INITIATED: 0,
  INITIATION_REPORTED: 0,
  INITIATION_CONFIRMED: 1,
  CONFIRM_COUNTER_PARTY_INITIATION: 1,
  READY_TO_CLAIM: 2,
  WAITING_FOR_CLAIM_CONFIRMATIONS: 2,
  GET_REFUND: 2,
  WAITING_FOR_REFUND_CONFIRMATIONS: 2,
  REFUNDED: 3,
  SUCCESS: 3,
  READY_TO_SEND: 3
}

export const ORDER_STATUS_LABEL_MAP = {
  QUOTE: 'Locking {from}',
  SECRET_READY: 'Locking {from}',
  INITIATED: 'Locking {from}',
  INITIATION_REPORTED: 'Locking {from}',
  INITIATION_CONFIRMED: 'Locking {to}',
  CONFIRM_COUNTER_PARTY_INITIATION: 'Locking {to}',
  READY_TO_CLAIM: 'Claiming {to}',
  WAITING_FOR_CLAIM_CONFIRMATIONS: 'Claiming {to}',
  GET_REFUND: 'Refunding {from}',
  WAITING_FOR_REFUND_CONFIRMATIONS: 'Refunding {from}',
  REFUNDED: 'Refunded',
  SUCCESS: 'Completed',
  READY_TO_SEND: 'Sending'
}

export function getOrderStatusLabel (item) {
  return ORDER_STATUS_LABEL_MAP[item.status].replace('{from}', item.from).replace('{to}', item.to)
}
