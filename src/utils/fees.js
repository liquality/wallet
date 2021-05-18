import BN from 'bignumber.js'
import cryptoassets from './cryptoassets'
import { chains, unitToCurrency } from '@liquality/cryptoassets'
import { isERC20, isEthereumChain } from './asset'

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
    [TX_TYPES.SEND]: 290, // Assume 2 inputs
    [TX_TYPES.SWAP_INITIATION]: 370, // Assume 2 inputs
    [TX_TYPES.SWAP_CLAIM]: 143
  },
  ETH: {
    [TX_TYPES.SEND]: 21000,
    [TX_TYPES.SWAP_INITIATION]: 150000,
    [TX_TYPES.SWAP_CLAIM]: 45000
  },
  RBTC: {
    [TX_TYPES.SEND]: 21000,
    [TX_TYPES.SWAP_INITIATION]: 160000,
    [TX_TYPES.SWAP_CLAIM]: 45000
  },
  ERC20: {
    [TX_TYPES.SEND]: 90000,
    [TX_TYPES.SWAP_INITIATION]: 600000 + 94500, // Contract creation + erc20 transfer
    [TX_TYPES.SWAP_CLAIM]: 100000
  },
  BNB: {
    [TX_TYPES.SEND]: 21000,
    [TX_TYPES.SWAP_INITIATION]: 150000,
    [TX_TYPES.SWAP_CLAIM]: 45000
  },
  POLYGON: {
    [TX_TYPES.SEND]: 21000,
    [TX_TYPES.SWAP_INITIATION]: 150000,
    [TX_TYPES.SWAP_CLAIM]: 45000
  },
  NEAR: {
    [TX_TYPES.SEND]: 10000000000000,
    [TX_TYPES.SWAP_INITIATION]: 10000000000000,
    [TX_TYPES.SWAP_CLAIM]: 8000000000000
  }
}

const FEE_TYPES = {
  ETH: 'ETH',
  BTC: 'BTC',
  RBTC: 'RBTC',
  NEAR: 'NEAR',
  POLYGON: 'POLYGON'
}

const FEE_OPTIONS = {
  SLOW: { name: 'Slow', label: 'Slow' },
  AVERAGE: { name: 'Average', label: 'Avg' },
  FAST: { name: 'Fast', label: 'Fast' }
}

function getTxFee (_asset, type, _feePrice) {
  const chainId = cryptoassets[_asset].chain
  const nativeAsset = chains[chainId].nativeAsset
  const feePrice = isEthereumChain(_asset) ? BN(_feePrice).times(1e9) : _feePrice // ETH fee price is in gwei
  const asset = isERC20(_asset) ? 'ERC20' : _asset
  const feeUnits = FEE_UNITS[asset][type]
  const fee = BN(feeUnits).times(feePrice)
  return unitToCurrency(cryptoassets[nativeAsset], fee)
}

function getFeeLabel (fee) {
  const name = fee.toUpperCase()
  return FEE_OPTIONS[name].label
}

export { TX_TYPES, FEE_TYPES, FEE_OPTIONS, getTxFee, getFeeLabel }
