function shortenAddress (address) {
  const prefix = address.startsWith('0x') ? '0x' : ''
  return `${prefix}${address.replace('0x', '').substring(0, 4)}...${address.substring(address.length - 4)}`
}

export { shortenAddress }
