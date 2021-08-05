import BN from 'bignumber.js'
import cryptoassets from './cryptoassets'
import { unitToCurrency } from '@liquality/cryptoassets'

export const VALUE_DECIMALS = 6

export const dp = (amount, coin) => {
  if (!amount) return amount
  return BN(amount).dp(cryptoassets[coin].decimals)
}

export const dpUI = (amount, dp = VALUE_DECIMALS) => {
  if (!amount) return amount

  return BN(amount).dp(dp, BN.ROUND_FLOOR)
}

export const prettyBalance = (amount, coin, dp = VALUE_DECIMALS) => {
  if (!amount || !coin) return amount

  amount = unitToCurrency(cryptoassets[coin], amount)

  return dpUI(amount, dp)
}

export const prettyFiatBalance = (amount, rate) => {
  if (!amount || !rate) return amount
  const fiatAmount = cryptoToFiat(amount, rate)
  return formatFiat(fiatAmount)
}

export const cryptoToFiat = (amount, rate) => {
  if (!rate) return BN(amount)
  return BN(amount).times(rate)
}

export const fiatToCrypto = (amount, rate) => {
  if (!rate) return amount
  return BN(amount).dividedBy(rate).dp(VALUE_DECIMALS, BN.ROUND_FLOOR)
}

export const formatFiat = (amount) => {
  return amount.toFormat(2, BN.ROUND_CEIL)
}
