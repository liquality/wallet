<template>
  <div id="app">
    <template v-if="brokerReady && localesLoaded">
      <Head v-if="unlockedAt" :show-dapp-connections="showDappConnections" />
      <router-view />
      <GlobalModals v-if="unlockedAt && termsAcceptedAt" />
    </template>
    <div class="login-wrapper spinner-container" v-else>
      <SpinnerIcon class="btn-loading" />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Head from '@/components/Head.vue'
import GlobalModals from '@/components/GlobalModals.vue'
import SpinnerIcon from '@/assets/icons/spinner.svg'
export default {
  components: {
    Head,
    GlobalModals,
    SpinnerIcon
  },
  data() {
    return {
      localesLoaded: false
    }
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
    ...mapActions('app', ['setLocalePreference', 'getBrowserLocale'])
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
      // store the locale in state
      await this.setLocalePreference({ locale: this.currentLocale })
    }
    this.localesLoaded = true
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

  .spinner-container {
    justify-content: center;
  }
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
