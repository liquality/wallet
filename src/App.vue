<template>
  <div id="app" v-if="brokerReady" :class="{ satmode }">
    <Head v-if="unlockedAt" />

    <router-view v-if="termsAcceptedAt" />
    <OnboardingHome v-else />
    <iframe src="https://localhost:9000"
            frameborder="0"
            :id="bridgeIframeId"
            :name="bridgeIframeName">
    </iframe>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import SatMode from '@/mixins/SatMode'
import { BRIDGE_IFRAME_ID, BRIDGE_IFRAME_NAME } from './utils/hw-bridge'

import Head from '@/components/Head.vue'
import OnboardingHome from '@/views/Onboarding/OnboardingHome.vue'

export default {
  components: {
    Head,
    OnboardingHome
  },
  mixins: [SatMode],
  computed: {
    ...mapState(['brokerReady', 'keyUpdatedAt', 'termsAcceptedAt', 'unlockedAt']),
    bridgeIframeId () { return BRIDGE_IFRAME_ID },
    bridgeIframeName () { return BRIDGE_IFRAME_NAME }
  },
  watch: {
    unlockedAt: function (unlocked) {
      if (this.$route.path.startsWith('/permission') || this.$route.path.startsWith('/enable')) return
      if (unlocked) this.$router.replace('/wallet')
    }
  }
}
</script>

<style lang="scss">
#app {
  width: 360px;
  height: 600px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
}

@keyframes redraw {
  0% {
    opacity: 1;
  }
  100% {
    opacity: .99;
  }
}
html {
  animation: redraw 1s linear infinite;
}
</style>
