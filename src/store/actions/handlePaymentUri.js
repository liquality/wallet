import qs from 'qs'
import cryptoassets from '../../utils/cryptoassets'

export const handlePaymentUri = async ({ dispatch }, { data }) => {
  const { uri } = data

  const parsed = new URL(uri)

  const asset = {
    ethereum: 'ETH',
    bitcoin: 'BTC'
  }[parsed.protocol.replace(':', '')]

  if (!asset) throw new Error('Unsupported payment URI')

  const address = parsed.pathname
  const params = qs.parse(parsed.search.replace('?', ''))
  const value = parseFloat(params.amount || params.value)
  const unitValue = cryptoassets[asset].currencyToUnit(value)

  return dispatch('requestPermission', {
    data: {
      asset,
      method: 'chain.sendTransaction',
      args: [address, unitValue]
    }
  })
}
