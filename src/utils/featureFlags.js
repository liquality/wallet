import * as LaunchDarkly from 'launchdarkly-js-client-sdk'

const FeatureFlags = {
  install: function (Vue, options) {
    Vue.prototype.$featureFlagReady = Vue.observable(false)
    let onFeatureFlagReadyCalls = []
    const user = { key: options.userId }
    const LaunchDarklyClient = LaunchDarkly.initialize(options.key, user)

    Vue.prototype.$onFeatureFlagReady = (cb) => {
      if (Vue.$featureFlagReady === true) {
        cb()
      } else {
        onFeatureFlagReadyCalls.push(cb)
      }
    }

    LaunchDarklyClient.on('ready', function () {
      Vue.$featureFlagReady = true
      onFeatureFlagReadyCalls.forEach(c => c())
      onFeatureFlagReadyCalls = []
    })

    Vue.prototype.$getFeatureFlag = (key, defaultValue) => {
      return LaunchDarklyClient.variation(key, defaultValue)
    }
  }
}

export default FeatureFlags
