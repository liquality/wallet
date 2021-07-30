import { unitToCurrency } from '@liquality/cryptoassets'
import cryptoassets from './cryptoassets'

export function calculateQuoteRate (quote) {
  const fromAmount = unitToCurrency(cryptoassets[quote.from], quote.fromAmount)
  const toAmount = unitToCurrency(cryptoassets[quote.to], quote.toAmount)
  return toAmount.div(fromAmount)
}
