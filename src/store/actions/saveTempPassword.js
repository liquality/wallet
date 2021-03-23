export const saveTempPassword = async ({ commit }, { password }) => {
  commit('SAVE_PASSWORD', { password })
}
