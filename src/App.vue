<template>
  <div id="app" v-if="brokerReady">
    <NavBar v-if="unlockedAt" />

    <router-view v-if="unlockedAt && termsAcceptedAt" />
    <UnlockWallet v-else-if="!unlockedAt && termsAcceptedAt" />
    <OnboardingHome v-else />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import NavBar from '@/views/v2/NavBar.vue'
import OnboardingHome from '@/views/v2/Onboarding/OnboardingHome.vue'
import UnlockWallet from '@/views/v2/UnlockWallet.vue'

export default {
  components: {
    NavBar,
    OnboardingHome,
    UnlockWallet
  },
  computed: mapState(['brokerReady', 'keyUpdatedAt', 'termsAcceptedAt', 'unlockedAt']),
  watch: {
    unlockedAt: function (unlocked) {
      if (unlocked) this.$router.replace('/wallet')
    }
  }
}
</script>

<style lang="scss">
#app {
  width: 375px;
  height: 600px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
}
</style>
