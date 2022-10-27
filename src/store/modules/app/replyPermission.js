import { errorToLiqualityErrorString } from '@liquality/error-parser/dist/src/utils'
import { emitter } from '../../utils'

export const replyPermission = async ({ dispatch }, { request, allowed }) => {
  const response = { allowed }
  if (allowed) {
    try {
      response.result = await dispatch('executeRequest', { request })
    } catch (error) {
      response.error = errorToLiqualityErrorString(error)
    }
  }

  emitter.$emit(`permission:${request.id}`, response)

  return response
}
