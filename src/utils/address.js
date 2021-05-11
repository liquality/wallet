function shortenAddress (address) {
  const prefix = address.substring(0, 1).includes('0x') ? '0x' : ''
  return `${prefix}${address.replace('0x', '').substring(0, 4)}...${address.substring(address.length - 4)}`
}

export { shortenAddress }
