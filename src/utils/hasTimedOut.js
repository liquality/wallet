import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'

export function hasTimedOut (transaction) {
  return Date.now() - transaction.startTime > chains[cryptoassets[transaction.from].chain].txFailureTimeout
}
