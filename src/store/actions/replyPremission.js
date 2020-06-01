import { emitter } from '../utils'

export const replyPremission = async (context, { id, allowed }) => {
  emitter.$emit(`permission:${id}`, allowed)
}
