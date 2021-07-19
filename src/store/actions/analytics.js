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

export const setupAnalytics = ({ commit, state }) => {
  let userId
  if (!state.analytics || !state.analytics.userId) {
    userId = uuidv4()
    commit('INITIALIZE_ANALYTICS', {
      userId,
      acceptedDate: null,
      askedDate: null,
      notAskAgain: false
    })
  } else {
    userId = state.analytics.userId
  }

  const { platform, userAgent } = navigator
  return analytics.identify(userId, {
    platform,
    userAgent
  })
}

export const trackAnalytics = ({ commit }, { event, properties = {} }) => {
// TODO: add verification for acepted analytics
//  if (state.analytics && state.analytics.acceptedDate) {
//     return analytics.track(event, ...properties)
//  }
  return analytics.track(event, ...properties)
}
