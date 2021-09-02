import { v4 as uuidv4 } from 'uuid'
import { version as walletVersion } from '../../../package.json'
import amplitude from 'amplitude-js'

const useAnalytics = !!process.env.VUE_APP_AMPLITUDE_API_KEY
console.log('ANALITYCS_ENABLED', useAnalytics)

export const initializeAnalyticsPreferences = ({ commit }, { accepted }) => {
  commit('SET_ANALYTICS_PREFERENCES', {
    userId: uuidv4(),
    acceptedDate: accepted ? Date.now() : null,
    askedTimes: 0,
    askedDate: Date.now(),
    notAskAgain: false
  })
}

export const updateAnalyticsPreferences = ({
  commit,
  state
}, payload) => {
  commit('SET_ANALYTICS_PREFERENCES', { ...payload })
}

export const setAnalyticsResponse = async ({
  commit,
  state
}, { accepted }) => {
  if (accepted) {
    commit('SET_ANALYTICS_PREFERENCES', { acceptedDate: Date.now() })
  } else {
    commit('SET_ANALYTICS_PREFERENCES', { acceptedDate: null })
  }
}

export const initializeAnalytics = async ({
  commit,
  dispatch,
  state
}) => {
  if (!state.analytics || !state.analytics.userId) {
    await dispatch('initializeAnalyticsPreferences', { accepted: false })
  } else if (state.analytics?.acceptedDate && useAnalytics) {
    amplitude.getInstance().init(
      process.env.VUE_APP_AMPLITUDE_API_KEY,
      state.analytics?.userId
    )
    commit('app/ANALITYCS_STARTED', null, { root: true })
  }
}

export const trackAnalytics = ({
  state,
  commit
}, {
  event,
  properties = {}
}) => {
  if (useAnalytics &&
    state.analytics &&
    state.analytics.acceptedDate &&
    state.analytics.userId) {
    const {
      activeNetwork,
      activeWalletId,
      version
    } = state
    return amplitude.getInstance().logEvent(event, {
      ...properties,
      network: activeNetwork,
      walletId: activeWalletId,
      migrationVersion: version,
      walletVersion
    })
  }
}

export const checkAnalyticsOptIn = ({
  state,
  commit,
  dispatch
}) => {
  const { acceptedDate } = state.analytics

  if (!acceptedDate) {
    // not to exceed 2x a/week every 2 weeks
    const askedDate = new Date(state.analytics?.askedDate)
    const currentDate = new Date()

    const pastMonth = askedDate.getMonth()
    const pastDay = askedDate.getDay()
    const pastDayOfMonth = askedDate.getDate()
    const currentMonth = currentDate.getMonth()
    const currentDay = currentDate.getDay()
    const currentDayOfMonth = currentDate.getDate()

    if (currentMonth === pastMonth) {
      // check for every two weeks
      if (currentDayOfMonth >= (pastDayOfMonth + 15)) {
        commit('SET_ANALYTICS_PREFERENCES', {
          askedDate: Date.now()
        })
        dispatch('app/setAnalyticsOptInModalOpen', { open: true }, { root: true })
      } else if (currentDay >= (pastDay + 2)) {
        // check for not to exceed 2x a/week
        commit('SET_ANALYTICS_PREFERENCES', {
          askedDate: Date.now()
        })
        dispatch('app/setAnalyticsOptInModalOpen', { open: true }, { root: true })
      }
    } else if (currentMonth > pastMonth) {
      commit('SET_ANALYTICS_PREFERENCES', {
        askedDate: Date.now()
      })
      dispatch('app/setAnalyticsOptInModalOpen', { open: true }, { root: true })
    }
  }
}
