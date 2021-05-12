function shortenAddress (address) {
  const sliced = address.slice(0, 3)
  const prefix = sliced.includes('0x') ? '0x' : ''
  return `${prefix}${address.replace('0x', '').substring(0, 4)}...${address.substring(address.length - 4)}`
}

export { shortenAddress }
