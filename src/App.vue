<template>
  <div id="app" v-if="brokerReady">
    <Head v-if="unlockedAt" :show-dapp-connections="showDappConnections" />
    <router-view />
    <template v-if="unlockedAt && termsAcceptedAt">
      <GlobalModals />
    </template>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Head from '@/components/Head.vue'
import GlobalModals from '@/components/GlobalModals.vue'

export default {
  components: {
    Head,
    GlobalModals
  },
  computed: {
    ...mapState(['activeNetwork', 'brokerReady', 'keyUpdatedAt', 'termsAcceptedAt', 'unlockedAt']),
    showDappConnections() {
      return !this.$route.path.startsWith('/permission') && !this.$route.path.startsWith('/enable')
    }
  },
  methods: {
    ...mapActions(['initializeAnalytics'])
  },
  async created() {
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
    opacity: 0.99;
  }
}
html {
  animation: redraw 1s linear infinite;
}
</style>
