import BN from 'bignumber.js'
import { unitToCurrency } from '@liquality/cryptoassets'
import cryptoassets from './cryptoassets'
import { SwapProviderType, getSwapProviderConfig } from './swaps'

export function calculateQuoteRate (quote) {
  const fromAmount = unitToCurrency(cryptoassets[quote.from], quote.fromAmount)
  const toAmount = unitToCurrency(cryptoassets[quote.to], quote.toAmount)
  return toAmount.div(fromAmount)
}

export function sortQuotes (quotes, network) {
  return quotes.slice(0)
    .sort((a, b) => {
      const isCrossChain = cryptoassets[a.from].chain !== cryptoassets[a.to].chain
      if (isCrossChain) { // Prefer Liquality for crosschain swaps where liquidity is available
        if (getSwapProviderConfig(network, a.provider).type === SwapProviderType.LIQUALITY) return -1
        else if (getSwapProviderConfig(network, b.provider).type === SwapProviderType.LIQUALITY) return 1
      }

      return BN(b.toAmount).minus(a.toAmount).toNumber()
    })
}
