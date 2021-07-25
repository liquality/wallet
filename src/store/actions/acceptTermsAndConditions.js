export const acceptTermsAndConditions = async ({ commit, dispatch }, { analyticsAccepted }) => {
  commit('ACCEPT_TNC')
  if (analyticsAccepted) {
    await dispatch('initializeAnalyticsPreferences', {
      accepted: analyticsAccepted
    })
    await dispatch('initializeAnalytics')
  }
}
