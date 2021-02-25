function shortenAddress (address) {
  if (address && address.type === 'Buffer') {
    return Buffer.from(address.data).toString('hex')
  }

  if (typeof address !== 'string') return ''
  const prefix = address.includes('0x') ? '0x' : ''
  return `${prefix}${address.replace('0x', '').substring(0, 4)}...${address.substring(address.length - 4)}`
}

export { shortenAddress }
