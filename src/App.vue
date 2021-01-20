<template>
  <div id="app" v-if="brokerReady" :class="{ satmode }">
    <Head v-if="unlockedAt" />

    <router-view v-if="termsAcceptedAt" />
    <OnboardingHome v-else />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import SatMode from '@/mixins/SatMode'

import Head from '@/components/Head.vue'
import OnboardingHome from '@/views/Onboarding/OnboardingHome.vue'

export default {
  components: {
    Head,
    OnboardingHome
  },
  mixins: [SatMode],
  computed: mapState(['brokerReady', 'keyUpdatedAt', 'termsAcceptedAt', 'unlockedAt']),
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
