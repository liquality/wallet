import { emitter } from '../../utils'

export const replyOriginAccess = async ({ rootGetters }, { origin, allowed, accountId }) => {
  if (allowed && accountId) {
    const account = rootGetters.accountItem(accountId)
    emitter.$emit(`origin:${origin}`, allowed, account.id, account.chain)
  } else {
    emitter.$emit(`origin:${origin}`, allowed)
  }
}
