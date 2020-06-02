import { emitter } from '../utils'

export const replyOriginAccess = async (context, { origin, allowed }) => {
  emitter.$emit(`origin:${origin}`, allowed)
}
