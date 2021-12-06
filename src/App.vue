<template>
  <div id="app" v-if="brokerReady">
    <Head v-if="unlockedAt" />
    <router-view />
    <template v-if="unlockedAt && termsAcceptedAt">
      <AnalyticsOptInModal/>
      <WatsNewModal/>
    </template>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Head from '@/components/Head.vue'
import AnalyticsOptInModal from '@/components/AnalyticsOptInModal.vue'
import WatsNewModal from '@/components/WatsNewModal.vue'

export default {
  components: {
    Head,
    AnalyticsOptInModal,
    WatsNewModal
  },
  computed: {
    ...mapState([
      'activeNetwork',
      'brokerReady',
      'keyUpdatedAt',
      'termsAcceptedAt',
      'unlockedAt'
    ])
  },
  methods: {
    ...mapActions(['initializeAnalytics'])
  },
  watch: {
    unlockedAt: function (unlocked) {
      if (this.$route.path.startsWith('/permission') || this.$route.path.startsWith('/enable') || this.$route.path.startsWith('/request-unlock')) return
      if (unlocked) this.$router.replace('/wallet')
    },
    activeNetwork: function (_network) {
      if (['Send', 'Receive', 'Swap', 'Account', 'SwapDetails', 'WalletActivity'].includes(this.$route.name)) {
        this.$router.replace('/wallet')
      }
    }
  },
  async created () {
    await this.initializeAnalytics()
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
