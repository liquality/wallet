import { emitter } from '../utils'

export const replyOriginAccess = async ({ getters }, { origin, allowed, accountId }) => {
  if (allowed && accountId) {
    const account = getters.accountItem(accountId)
    emitter.$emit(`origin:${origin}`, allowed, account.id, account.chain)
  } else {
    emitter.$emit(`origin:${origin}`, allowed)
  }
}
