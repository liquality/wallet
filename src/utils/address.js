export function shortenAddress (address) {
  const prefix = address.startsWith('0x') ? '0x' : ''
  const isTerra = address.startsWith('terra')
  return `${prefix}${address.replace('0x', '').substring(0, prefix ? 4 : 6)}...${address.substring(isTerra ? address.length - 6 : address.length - 4)}`
}

export const BTC_ADDRESS_TYPE_TO_PREFIX = {
  legacy: 44,
  'p2sh-segwit': 49,
  bech32: 84
}
