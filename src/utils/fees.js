import BN from 'bignumber.js'
import cryptoassets from './cryptoassets'
import { isERC20, getChainFromAsset } from './asset'

const TX_TYPES = {
  SEND: 'SEND',
  SWAP_INITIATION: 'SWAP_INITIATION',
  SWAP_CLAIM: 'SWAP_CLAIM'
}

/**
 * TODO: Move to Chain Abstraction Layer in the form
 * client.chain.getFeeUnits('swap.initiationSwap')
 * */
const FEE_UNITS = {
  BTC: {
    [TX_TYPES.SEND]: 209, // Assume 2 inputs
    [TX_TYPES.SWAP_INITIATION]: 300, // Assume 2 inputs
    [TX_TYPES.SWAP_CLAIM]: 143
  },
  ETH: {
    [TX_TYPES.SEND]: 21000,
    [TX_TYPES.SWAP_INITIATION]: 120000,
    [TX_TYPES.SWAP_CLAIM]: 21000
  },
  RBTC: {
    [TX_TYPES.SEND]: 21000,
    [TX_TYPES.SWAP_INITIATION]: 120000,
    [TX_TYPES.SWAP_CLAIM]: 21000
  },
  ERC20: {
    [TX_TYPES.SEND]: 90000,
    [TX_TYPES.SWAP_INITIATION]: 561000 + 94500, // Contract creation + erc20 transfer
    [TX_TYPES.SWAP_CLAIM]: 90000
  }
}

const FEE_TYPES = {
  GWEI: 'GWEI',
  SAT : 'SAT'
}

const FEE_TYPE_CONFIG = {
  ETH: 'GWEI',
  RBTC: 'GWEI',
  BTC : 'SAT'
}

function getTxFee (_asset, type, _feePrice) {
  const chainAsset = getChainFromAsset(_asset)
  const feePrice = ['ETH', 'RBTC'].includes(getChainFromAsset(_asset)) ? BN(_feePrice).times(1e9) : _feePrice // ETH fee price is in gwei
  const asset = isERC20(_asset) ? 'ERC20' : _asset
  const feeUnits = FEE_UNITS[asset][type]
  const fee = BN(feeUnits).times(feePrice)
  return cryptoassets[chainAsset].unitToCurrency(fee)
}


function getFeeType(asset) {
  return FEE_TYPE_CONFIG[asset];
}

export { TX_TYPES, FEE_TYPES, FEE_TYPE_CONFIG, getTxFee, getFeeType }
