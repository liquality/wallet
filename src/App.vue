<template>
  <div id="app" v-if="brokerReady">
    <div v-if="!termsAcceptedAt || !keyUpdatedAt">
      <OnboardingHome v-if="!termsAcceptedAt" />
      <OnboardingPassword v-else-if="termsAcceptedAt && !keyUpdatedAt" />
    </div>
    <router-view v-else />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import OnboardingHome from './views/Onboarding/OnboardingHome.vue'
import OnboardingPassword from './views/Onboarding/OnboardingPassword.vue'

export default {
  components: {
    OnboardingHome,
    OnboardingPassword
  },
  computed: mapState(['brokerReady', 'keyUpdatedAt', 'termsAcceptedAt'])
}
</script>
