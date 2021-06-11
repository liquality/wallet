import { prettyBalance } from '../../utils/coinFormatter'
import * as actions from './actions'
import SwapDetails from './SwapDetails.vue'

const TX_TYPES = {
  SWAP: 'SWAP'
}

const feeUnits = {
  SWAP: {
    ETH: 100000 + 400000, // (potential)Approval(erc20) + Swap
    BNB: 100000 + 400000,
    POLYGON: 100000 + 400000,
    ERC20: 100000 + 400000
  }
}

// TOOD: constants for status

const statuses = {
  WAITING_FOR_APPROVE_CONFIRMATIONS: {
    step: 0,
    label: 'Approving {from}',
    filterStatus: 'PENDING',
    notification (swap) {
      return {
        message: `Approving ${swap.from}`
      }
    }
  },
  APPROVE_CONFIRMED: {
    step: 1,
    label: 'Swapping {from}',
    filterStatus: 'PENDING'
  },
  WAITING_FOR_SWAP_CONFIRMATIONS: {
    step: 1,
    label: 'Swapping {from}',
    filterStatus: 'PENDING',
    notification () {
      return {
        message: 'Engaging the unicorn'
      }
    }
  },
  SUCCESS: {
    step: 2,
    label: 'Completed',
    filterStatus: 'COMPLETED',
    notification (swap) {
      return {
        message: `Swap completed, ${prettyBalance(swap.toAmount, swap.to)} ${swap.to} ready to use`
      }
    }
  },
  FAILED: {
    step: 2,
    label: 'Swap Failed',
    filterStatus: 'REFUNDED',
    notification () {
      return {
        message: 'Swap failed'
      }
    }
  }
}

export default {
  ...actions,
  feeUnits,
  fromTxType: TX_TYPES.SWAP,
  toTxType: null,
  SwapDetails,
  statuses,
  totalSteps: 3
}
