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

  const id = uuidv4()
  const createdAt = Date.now()
  return {
    id,
    walletId,
    type,
    name,
    chain,
    addresses,
    assets,
    balances: balances || {},
    createdAt,
    updatedAt: null
  }
}
