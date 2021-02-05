import { v4 as uuidv4 } from 'uuid'

export const createAccount = async (
  { commit },
  { walletId, name, chain, addresses, assets, type }) => {
  const id = uuidv4()
  const createdAt = Date.now()
  const account = {
    id,
    walletId,
    type,
    name,
    chain,
    addresses,
    assets,
    createdAt,
    updatedAt: null
  }
  commit('CREATE_ACCOUNT', account)
  return account
}
