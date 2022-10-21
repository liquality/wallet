import qs from 'qs'
import { currencyToUnit } from '@liquality/cryptoassets'
import { CUSTOM_ERRORS, createInternalError } from '@liquality/error-parser'

export const handlePaymentUri = async ({ dispatch, rootGetters }, { data }) => {
  const { uri } = data

  const parsed = new URL(uri)

  const asset = {
    ethereum: 'ETH',
    bitcoin: 'BTC'
  }[parsed.protocol.replace(':', '')]

  if (!asset) throw createInternalError(CUSTOM_ERRORS.Unsupported.PaymentURI)

  const address = parsed.pathname
  const params = qs.parse(parsed.search.replace('?', ''))

  const value = parseFloat(params.amount || params.value)
  const unitValue = currencyToUnit(rootGetters.cryptoassets[asset], value).toNumber()

  return dispatch('requestPermission', {
    data: {
      asset,
      method: 'wallet.sendTransaction',
      args: [address, unitValue]
    }
  })
}
