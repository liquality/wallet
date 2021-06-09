import BN from 'bignumber.js'
import cryptoassets from './cryptoassets'
import { chains, unitToCurrency } from '@liquality/cryptoassets'
import { isERC20, isEthereumChain } from './asset'
import { protocols } from '../swaps'

/**
 * TODO: Move to Chain Abstraction Layer in the form
 * client.chain.getFeeUnits('swap.initiationSwap')
 * */

const SEND_FEE_UNITS = {
  BTC: 290,
  ETH: 21000,
  RBTC: 21000,
  BNB: 21000,
  POLYGON: 21000,
  NEAR: 10000000000000,
  ERC20: 90000
}

const FEE_OPTIONS = {
  SLOW: { name: 'Slow', label: 'Slow' },
  AVERAGE: { name: 'Average', label: 'Avg' },
  FAST: { name: 'Fast', label: 'Fast' },
  CUSTOM: { name: 'Custom', label: 'Custom' }
}

function getSwapTxTypes (protocol) {
  const { fromTxType, toTxType } = protocols[protocol]
  return { fromTxType, toTxType }
}

function getSendFee (asset, feePrice) {
  return getTxFee(SEND_FEE_UNITS, asset, feePrice)
}

function getSwapFee (protocol, type, asset, feePrice) {
  const feeUnits = protocols[protocol].feeUnits
  if (feeUnits && type in feeUnits) {
    return getTxFee(feeUnits[type], asset, feePrice)
  } else {
    return BN(0) // There is no fee for this part of the swap
  }
}

function getTxFee (units, _asset, _feePrice) {
  const chainId = cryptoassets[_asset].chain
  const nativeAsset = chains[chainId].nativeAsset
  const feePrice = isEthereumChain(_asset) ? BN(_feePrice).times(1e9) : _feePrice // ETH fee price is in gwei
  const asset = isERC20(_asset) ? 'ERC20' : _asset
  const feeUnits = units[asset]
  const fee = BN(feeUnits).times(feePrice)
  return unitToCurrency(cryptoassets[nativeAsset], fee)
}

function getFeeLabel (fee) {
  const name = fee?.toUpperCase() || ''
  return FEE_OPTIONS?.[name]?.label || ''
}

export { FEE_OPTIONS, getSwapTxTypes, getSendFee, getSwapFee, getFeeLabel }
