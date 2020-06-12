export const proxyMutation = async ({ commit }, { type, payload }) => {
  commit(type, payload)
}
