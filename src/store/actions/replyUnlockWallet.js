import { emitter } from '../utils'

export const replyUnlockWallet = async (context, { id, unlocked }) => {
  emitter.$emit(`unlocked:${id}`, unlocked)
}
