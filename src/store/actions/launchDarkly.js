import * as LaunchDarkly from 'launchdarkly-js-client-sdk'

let LaunchDarklyClient

export const initializeLaunchDarkly = ({ state }) => {
  return new Promise((resolve) => {
    const { userId } = state.analytics
    const key = process.env.VUE_APP_LD_CLIENT_SIDE_ID_API_KEY
    LaunchDarklyClient = LaunchDarkly.initialize(key, { key: userId })
    LaunchDarklyClient.on('ready', function () {
      console.log('LaunchDarklyClient ready')
      resolve()
    })
  })
}

export const getFeatureFlag = async (_, { key, defaultValue }) => {
  return LaunchDarklyClient?.variation(key, defaultValue)
}
