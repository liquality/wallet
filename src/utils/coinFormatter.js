import BN from 'bignumber.js'
import cryptoassets from '@liquality/cryptoassets'

const DP_UI_MAP = {
  BTC: 6,
  ETH: 6,
  DAI: 6,
  USDC: 6,
  USDT: 6,
  WBTC: 6
}

export const dp = (amount, coin) => {
  if (!amount) return amount

  return BN(amount).dp(cryptoassets[coin.toLowerCase()].decimals)
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
