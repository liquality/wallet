import { v4 as uuidv4 } from 'uuid'

export const createAccount = async (
  { state, commit },
  {
    name,
    chain,
    addresses,
    assets,
    type,
    path
  }) => {
  const { activeWalletId } = state
  const id = uuidv4()
  const createdAt = Date.now()
  const account = {
    id,
    walletId: activeWalletId,
    type,
    path,
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
