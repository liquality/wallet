import BN from 'bignumber.js'
import cryptoassets from '@liquality/cryptoassets'

const DP_MAP = {
  BTC: 8,
  ETH: 18,
  DAI: 18,
  USDC: 6
}

const DP_UI_MAP = {
  BTC: 6,
  ETH: 6,
  DAI: 6,
  USDC: 6
}

export const dp = (amount, coin) => {
  if (!amount) return amount

  return BN(amount).dp(DP_MAP[coin])
}

export const dpUI = (amount, coin, floor = false) => {
  if (!amount) return amount

  return BN(amount).dp(DP_UI_MAP[coin], floor ? BN.ROUND_FLOOR : BN.ROUND_CEIL)
}

export const prettyBalance = (amount, coin, floor = false) => {
  if (!amount) return amount

  amount = cryptoassets[coin.toLowerCase()].unitToCurrency(amount)

  return dpUI(amount, coin, floor)
}
