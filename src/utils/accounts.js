import { v4 as uuidv4 } from 'uuid'

export const accountCreator = (payload) => {
  const { walletId, account } = payload
  const {
    name,
    chain,
    addresses,
    assets,
    balances,
    type
  } = account

  const _addresses = addresses.map(a => {
    if (a.startsWith('0x')) {
      return a.substring(2, a.length)
    }
    return a
  })
  const id = uuidv4()
  const createdAt = Date.now()
  return {
    id,
    walletId,
    type,
    name,
    chain,
    addresses: _addresses,
    assets,
    balances: balances || {},
    createdAt,
    updatedAt: null
  }
}
