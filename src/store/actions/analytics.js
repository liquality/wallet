import { v4 as uuidv4 } from 'uuid'
import Analytics from 'analytics'
import segmentPlugin from '@analytics/segment'

const analytics = Analytics({
  app: process.env.VUE_APP_ANALYTICS_NAME,
  plugins: [
    segmentPlugin({
      writeKey: process.env.VUE_APP_ANALYTICS_WRITE_KEY
    })
  ]
})

export const initializeAnalyticsPreferences = ({ commit }, { accepted }) => {
  commit('SET_ANALYTICS_PREFERENCES', {
    userId: uuidv4(),
    acceptedDate: accepted ? Date.now() : null,
    askedTimes: 0,
    askedDate: null,
    notAskAgain: false
  })
}

export const updateAnalyticsPreferences = ({ commit, state }, payload) => {
  commit('SET_ANALYTICS_PREFERENCES', { ...payload })
}

export const setAnalyticsResponse = async ({ commit, state }, { accepted }) => {
  if (accepted) {
    commit('SET_ANALYTICS_PREFERENCES', { acceptedDate: Date.now() })
  } else {
    commit('SET_ANALYTICS_PREFERENCES', { acceptedDate: null })
  }
}

export const initializeAnalytics = async ({ commit, state }) => {
  if (state.analytics && state.analytics.acceptedDate) {
    await analytics.identify(state.analytics.userId)
    commit('app/ANALITYCS_STARTED', null, { root: true })
  }
}

export const trackAnalytics = ({ state, commit }, { event, properties = {} }) => {
  if (state.analytics && state.analytics.acceptedDate && state.analytics.userId) {
    const { activeNetwork } = state
    return analytics.track(event, { ...properties, activeNetwork })
  }
}

export const checkAnalyticsOptIn = ({ state, commit, dispatch }) => {
  if (!state.analytics?.acceptedDate) {
    dispatch('setAnalyticsOptInModalOpen', { open: true }, { root: true })
  }
}
