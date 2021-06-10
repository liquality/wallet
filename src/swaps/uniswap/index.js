import { prettyBalance } from '../../utils/coinFormatter'
import * as actions from './actions'
import SwapDetails from './SwapDetails.vue'

const TX_TYPES = {
  SWAP: 'SWAP'
}

const feeUnits = {
  SWAP: {
    ETH: 400000,
    BNB: 400000,
    POLYGON: 400000,
    ERC20: 400000
  }
}

// TOOD: constants for status

const statuses = {
  WAITING_FOR_CONFIRMATIONS: {
    step: 0,
    label: 'Pending',
    filterStatus: 'PENDING',
    notification () {
      return {
        message: 'Swap transaction sent'
      }
    }
  },
  SUCCESS: {
    step: 1,
    label: 'Completed',
    filterStatus: 'COMPLETED',
    notification (swap) {
      return {
        message: `Swap completed, ${prettyBalance(swap.toAmount, swap.to)} ${swap.to} ready to use`
      }
    }
  },
  FAILED: {
    step: 1,
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
  totalSteps: 2
}
