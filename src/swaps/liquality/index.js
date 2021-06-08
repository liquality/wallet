import * as actions from './actions'

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

export default {
  ...actions,
  feeUnits,
  fromTxType: TX_TYPES.SWAP_INITIATION,
  toTxType: TX_TYPES.SWAP_CLAIM
}
