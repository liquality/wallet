import { LiqualityError } from '@liquality/error-parser'
import { emitter } from '../../utils'

export const replyPermission = async ({ dispatch }, { request, allowed }) => {
  const response = { allowed }
  if (allowed) {
    try {
      response.result = await dispatch('executeRequest', { request })
    } catch (error) {
      response.error = error instanceof LiqualityError ? error.toString() : error.message
    }
  }

  emitter.$emit(`permission:${request.id}`, response)

  return response
}
