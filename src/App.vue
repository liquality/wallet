<template>
  <div id="app" v-if="brokerReady" :key="i18nVersion">
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
    ...mapState({
      locale: (state) => state.app?.locale
    }),
    showDappConnections() {
      return !this.$route.path.startsWith('/permission') && !this.$route.path.startsWith('/enable')
    },
    showLedgerBanner() {
      return this.$route.query.mode === 'tab'
    }
  },
  methods: {
    ...mapActions(['initializeAnalytics']),
    ...mapActions('app', ['setLocalePrefference', 'getBrowserLocale'])
  },
  async created() {
    await this.initializeAnalytics()
    if (this.locale) {
      await this.changeLocale(this.locale)
    } else {
      const browserLocale = await this.getBrowserLocale()
      const _locale = this.locales.includes(browserLocale)
        ? browserLocale
        : process.env.VUE_APP_DEFAULT_LOCALE
      await this.changeLocale(_locale)
      // store the local in state
      await this.setLocalePrefference({ locale: this.currentLocale })
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
    opacity: 0.99;
  }
}
html {
  animation: redraw 1s linear infinite;
}
</style>
