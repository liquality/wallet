import { prettyBalance } from '../../utils/coinFormatter'
import * as actions from './actions'
import SwapDetails from './SwapDetails.vue'

const TX_TYPES = {
  SWAP_INITIATION: 'SWAP_INITIATION',
  SWAP_CLAIM: 'SWAP_CLAIM'
}

const feeUnits = {
  SWAP_INITIATION: {
    BTC: 370, // Assume 2 inputs
    ETH: 165000,
    RBTC: 165000,
    BNB: 165000,
    POLYGON: 165000,
    NEAR: 10000000000000,
    ERC20: 600000 + 94500 // Contract creation + erc20 transfer
  },
  SWAP_CLAIM: {
    BTC: 143,
    ETH: 45000,
    RBTC: 45000,
    BNB: 45000,
    POLYGON: 45000,
    NEAR: 8000000000000,
    ERC20: 100000
  }
}

const statuses = {
  INITIATED: {
    step: 0,
    label: 'Locking {from}',
    filterStatus: 'PENDING'
  },
  INITIATION_REPORTED: {
    step: 0,
    label: 'Locking {from}',
    filterStatus: 'PENDING',
    notification () {
      return {
        message: 'Swap initiated'
      }
    }
  },
  INITIATION_CONFIRMED: {
    step: 0,
    label: 'Locking {from}',
    filterStatus: 'PENDING'
  },
  FUNDED: {
    step: 1,
    label: 'Locking {to}',
    filterStatus: 'PENDING'
  },
  CONFIRM_COUNTER_PARTY_INITIATION: {
    step: 1,
    label: 'Locking {to}',
    filterStatus: 'PENDING',
    notification (swap) {
      return {
        message: `Counterparty sent ${prettyBalance(swap.toAmount, swap.to)} ${swap.to} to escrow`
      }
    }
  },
  READY_TO_CLAIM: {
    step: 2,
    label: 'Claiming {to}',
    filterStatus: 'PENDING',
    notification () {
      return {
        message: 'Claiming funds'
      }
    }
  },
  WAITING_FOR_CLAIM_CONFIRMATIONS: {
    step: 2,
    label: 'Claiming {to}',
    filterStatus: 'PENDING'
  },
  WAITING_FOR_REFUND: {
    step: 2,
    label: 'Pending Refund',
    filterStatus: 'PENDING'
  },
  GET_REFUND: {
    step: 2,
    label: 'Refunding {from}',
    filterStatus: 'PENDING'
  },
  WAITING_FOR_REFUND_CONFIRMATIONS: {
    step: 2,
    label: 'Refunding {from}',
    filterStatus: 'PENDING'
  },
  REFUNDED: {
    step: 3,
    label: 'Refunded',
    filterStatus: 'REFUNDED',
    notification (swap) {
      return {
        message: `Swap refunded, ${prettyBalance(swap.fromAmount, swap.from)} ${swap.from} returned`
      }
    }
  },
  SUCCESS: {
    step: 3,
    label: 'Completed',
    filterStatus: 'COMPLETED',
    notification (swap) {
      return {
        message: `Swap completed, ${prettyBalance(swap.toAmount, swap.to)} ${swap.to} ready to use`
      }
    }
  },
  QUOTE_EXPIRED: {
    step: 3,
    label: 'Quote Expired',
    filterStatus: 'REFUNDED'
  }
}

export default {
  ...actions,
  feeUnits,
  fromTxType: TX_TYPES.SWAP_INITIATION,
  toTxType: TX_TYPES.SWAP_CLAIM,
  SwapDetails,
  statuses,
  totalSteps: 4
}
