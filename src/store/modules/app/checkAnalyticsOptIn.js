export const checkAnalyticsOptIn = ({ state, commit, dispatch }) => {
  const { acceptedDate } = state

  if (!acceptedDate) {
    // not to exceed 2x a/week every 2 weeks
    const askedDate = new Date(state.askedDate)
    const currentDate = new Date()

    const pastMonth = askedDate.getMonth()
    const pastDay = askedDate.getDay()
    const pastDayOfMonth = askedDate.getDate()
    const currentMonth = currentDate.getMonth()
    const currentDay = currentDate.getDay()
    const currentDayOfMonth = currentDate.getDate()

    if (currentMonth === pastMonth) {
      // check for every two weeks
      if (currentDayOfMonth >= pastDayOfMonth + 15) {
        commit('SET_ANALYTICS_PREFERENCES', {
          askedDate: Date.now()
        })
        dispatch('setAnalyticsOptInModalOpen', { open: true })
      } else if (currentDay >= pastDay + 2) {
        // check for not to exceed 2x a/week
        commit('SET_ANALYTICS_PREFERENCES', {
          askedDate: Date.now()
        })
        dispatch('setAnalyticsOptInModalOpen', { open: true })
      }
    } else if (currentMonth > pastMonth) {
      commit('SET_ANALYTICS_PREFERENCES', {
        askedDate: Date.now()
      })
      dispatch('setAnalyticsOptInModalOpen', { open: true })
    }
  }
}
