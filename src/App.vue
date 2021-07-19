<template>
  <div id="app" v-if="brokerReady">
    <Head v-if="unlockedAt" />

    <router-view v-if="termsAcceptedAt" />
    <OnboardingHome v-else />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Head from '@/components/Head.vue'
import OnboardingHome from '@/views/Onboarding/OnboardingHome.vue'

export default {
  components: {
    Head,
    OnboardingHome
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
    ...mapActions('setupAnalytics')
  },
  watch: {
    unlockedAt: function (unlocked) {
      if (this.$route.path.startsWith('/permission') || this.$route.path.startsWith('/enable') || this.$route.path.startsWith('/request-unlock')) return
      if (unlocked) this.$router.replace('/wallet')
    },
    activeNetwork: function (_network) {
      if (['Send', 'Receive', 'Swap'].includes(this.$route.name)) {
        this.$router.replace('/wallet')
      }
    }
  },
  created () {
    this.setupAnalytics()
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
