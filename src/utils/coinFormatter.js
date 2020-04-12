import BN from 'bignumber.js'

const DP_MAP = {
  BTC: 8,
  ETH: 18
}

const DP_UI_MAP = {
  BTC: 6,
  ETH: 6
}

export const dp = (amount, coin) => {
  if (!amount) return amount
  coin = coin.toUpperCase()
  return BN(amount).dp(DP_MAP[coin])
}

export const dpUI = (amount, coin, floor = false) => {
  if (!amount) return amount
  coin = coin.toUpperCase()
  return BN(amount).dp(DP_UI_MAP[coin], floor ? BN.ROUND_FLOOR : BN.ROUND_CEIL)
}
