import BN from 'bignumber.js'
import cryptoassets from '@liquality/cryptoassets'

const VALUE_DECIMALS = 6

export const dp = (amount, coin) => {
  if (!amount) return amount

  return BN(amount).dp(cryptoassets[coin].decimals)
}

export const dpUI = (amount, coin) => {
  if (!amount) return amount

  return BN(amount).dp(VALUE_DECIMALS, BN.ROUND_FLOOR)
}

export const prettyBalance = (amount, coin) => {
  if (!amount) return amount

  amount = cryptoassets[coin].unitToCurrency(amount)

  return dpUI(amount, coin)
}

export const prettyFiatBalance = (amount, rate) => {
  if (!amount) return amount

  const fiatAmount = BN(amount).times(rate)

  return fiatAmount.toFormat(2, BN.ROUND_CEIL)
}
