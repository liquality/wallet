import * as LaunchDarkly from 'launchdarkly-js-client-sdk'

let featureFlagReady = false

const getFeatureFlag = (client, { key, defaultValue }) => {
  return new Promise((resolve) => {
    if (featureFlagReady) {
      resolve(client.variation(key, defaultValue))
    } else {
    // wait 1 sec for client initialization
      setTimeout(() => {
        resolve(client.variation(key, defaultValue))
      }, 1000)
    }
  })
}

const FeatureFlags = {
  install: function (Vue, options) {
    Vue.prototype.$featureFlagReady = featureFlagReady
    const user = { key: options.key }
    const LaunchDarklyClient = LaunchDarkly.initialize('61672acc7a090f3159d47b8a', user)

    LaunchDarklyClient.on('ready', function () {
      featureFlagReady = true
      Vue.prototype.$featureFlagReady = featureFlagReady
      console.log('featureFlag is ready now')
    })

    Vue.directive('if-feature-flag', async (el, binding, vnode) => {
      const { key, val } = binding.value
      const flagValue = await getFeatureFlag(LaunchDarklyClient, { key, val })
      if (val !== flagValue) {
        // replace HTMLElement with comment node
        const comment = document.createComment(' ')
        Object.defineProperty(comment, 'setAttribute', {
          value: () => undefined
        })
        vnode.elm = comment
        vnode.text = ' '
        vnode.isComment = true
        vnode.context = undefined
        vnode.tag = undefined
        vnode.data.directives = undefined

        if (vnode.componentInstance) {
          vnode.componentInstance.$el = comment
        }

        if (el.parentNode) {
          el.parentNode.replaceChild(comment, el)
        }
      }
    })

    Vue.prototype.$getFeatureFlag = (key, defaultValue) => {
      return getFeatureFlag(LaunchDarklyClient, { key, defaultValue })
    }
  }
}

export default FeatureFlags
