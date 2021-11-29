export function shortenAddress (address) {
  const prefix = address.startsWith('0x') ? '0x' : ''
  return `${prefix}${address.replace('0x', '').substring(0, 6)}...${address.substring(address.length - 4)}`
}

export const BTC_ADDRESS_TYPE_TO_PREFIX = {
  legacy: 44,
  'p2sh-segwit': 49,
  bech32: 84
}
