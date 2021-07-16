import { emitter } from '../utils'

export const replyOriginAccess = async (context, { origin, allowed, chain, accountId }) => {
  emitter.$emit(`origin:${origin}`, allowed, accountId, chain)
}
