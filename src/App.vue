<template>
  <div id="app" v-if="brokerReady">
    <Head v-if="unlockedAt" />

    <router-view v-if="termsAcceptedAt" />
    <OnboardingHome v-else />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import Head from '@/views/Head.vue'
import OnboardingHome from '@/views/Onboarding/OnboardingHome.vue'

export default {
  components: {
    Head,
    OnboardingHome
  },
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
</style>
