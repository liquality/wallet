export const initializeAnalytics = async ({ commit, dispatch }) => {
  const started = await dispatch('initializeAnalytics', null, { root: true })
  if (started) commit('ANALITYCS_STARTED')
}
