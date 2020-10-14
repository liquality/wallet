import BN from 'bignumber.js'
import cryptoassets from '@liquality/cryptoassets'
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
    [TX_TYPES.SEND]: 178, // Assume 2 inputs
    [TX_TYPES.SWAP_INITIATION]: 192, // Assume 2 inputs
    [TX_TYPES.SWAP_CLAIM]: 143
  },
  ETH: {
    [TX_TYPES.SEND]: 21000,
    [TX_TYPES.SWAP_INITIATION]: 78226,
    [TX_TYPES.SWAP_CLAIM]: 13681
  },
  ERC20: {
    [TX_TYPES.SEND]: 38027,
    [TX_TYPES.SWAP_INITIATION]: 373868 + 57227, // Contract creation + erc20 transfer
    [TX_TYPES.SWAP_CLAIM]: 28630
  }
}

function getTxFee (_asset, type, _feePrice) {
  const chainAsset = getChainFromAsset(_asset)
  const feePrice = getChainFromAsset(_asset) === 'ETH' ? BN(_feePrice).times(1e9) : _feePrice // ETH fee price is in gwei
  const asset = isERC20(_asset) ? 'ERC20' : _asset
  const feeUnits = FEE_UNITS[asset][type]
  const fee = BN(feeUnits).times(feePrice)
  return cryptoassets[chainAsset.toLowerCase()].unitToCurrency(fee)
}

export { TX_TYPES, getTxFee }
