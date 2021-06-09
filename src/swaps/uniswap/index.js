import * as actions from './actions'

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

export default {
  ...actions,
  feeUnits,
  fromTxType: TX_TYPES.SWAP,
  toTxType: null
}
