<template>
  <div id="app">
    <template v-if="brokerReady && localesLoaded">
      <template v-if="unlockedAt && termsAcceptedAt">
        <Head :show-dapp-connections="showDappConnections" />
        <GlobalModals />
      </template>
      <router-view />
    </template>
    <div class="login-wrapper spinner-container" v-else>
      <SpinnerIcon class="btn-loading" />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Head from '@/components/Head.vue'
import SpinnerIcon from '@/assets/icons/spinner.svg'
export default {
  components: {
    Head,
    GlobalModals: () => import('@/components/GlobalModals.vue'),
    SpinnerIcon
  },
  data() {
    return {
      localesLoaded: false
    }
  },
  computed: {
    ...mapState([
      'activeNetwork',
      'brokerReady',
      'keyUpdatedAt',
      'termsAcceptedAt',
      'unlockedAt',
      'whatsNewModalVersion'
    ]),
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
    ...mapActions('app', ['setLocalePreference', 'getBrowserLocale', 'setWhatsNewModalContent'])
  },
  mounted() {
    this.initializeAnalytics()
    setTimeout(async () => {
      if (this.locale) {
        await this.changeLocale(this.locale)
      } else {
        const browserLocale = await this.getBrowserLocale()
        const _locale = this.locales.includes(browserLocale)
          ? browserLocale
          : process.env.VUE_APP_DEFAULT_LOCALE
        await this.changeLocale(_locale)
        // store the locale in state
        await this.setLocalePreference({ locale: _locale })
      }

      if (
        this.whatsNewModalVersion !== this.appVersion ||
        process.env.VUE_APP_SHOW_WHATS_NEW_ALWAYS
      ) {
        const content = await import(`@/locales/${this.currentLocale}/whats_new.json`)
        this.setWhatsNewModalContent({ content: content.default })
      }
      this.localesLoaded = true
    }, 1000)
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
