import BN from 'bignumber.js'
import cryptoassets from './cryptoassets'
import { chains, unitToCurrency } from '@liquality/cryptoassets'
import { isERC20, isEthereumChain } from './asset'

const FEE_OPTIONS = {
  SLOW: { name: 'Slow', label: 'Slow' },
  AVERAGE: { name: 'Average', label: 'Avg' },
  FAST: { name: 'Fast', label: 'Fast' },
  CUSTOM: { name: 'Custom', label: 'Custom' }
}

const feePriceInWei = (asset, feePrice) => {
  return isEthereumChain(asset) ? BN(feePrice).times(1e9) : feePrice // ETH fee price is in gwei
}

function getSendFee(asset, feePrice) {
  const assetInfo = cryptoassets[asset]
  const fee = BN(assetInfo.sendGasLimit).times(feePriceInWei(asset, feePrice))
  return unitToCurrency(assetInfo, fee)
}

function getTxFee(units, _asset, _feePrice) {
  const chainId = cryptoassets[_asset].chain
  const nativeAsset = chains[chainId].nativeAsset
  const asset = isERC20(_asset) ? 'ERC20' : _asset
  const feeUnits = chainId === 'terra' ? units['LUNA'] : units[asset] // Terra ERC20 assets use gas equal to Terra Native assets
  const fee = BN(feeUnits).times(feePriceInWei(_asset, _feePrice))
  return unitToCurrency(cryptoassets[nativeAsset], fee)
}

function getFeeLabel(fee) {
  const name = fee?.toUpperCase() || ''
  return FEE_OPTIONS?.[name]?.label || ''
}

export { FEE_OPTIONS, getSendFee, getTxFee, getFeeLabel }
