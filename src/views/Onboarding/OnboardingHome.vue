<template>
  <div class="onboading-home login-wrapper no-outer-pad">
    <div class="onboading-home_header">
      <LogoWallet />
    </div>
    <div class="onboading-home_tnc">
      <h4>{{ $t('pages.onboarding.home.termsAndPrivacy') }}</h4>
      <div v-if="termsLoading" class="loading-container">
        <SpinnerIcon class="btn-loading" />
      </div>
      <div v-else v-html="termsContent"></div>

      <div class="button-group onboading-home_tnc__actions">
        <button
          id="terms_privacy_cancel_button"
          class="btn btn-light btn-outline-primary btn-lg"
          @click="$router.push('/')"
          :disabled="termsLoading"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          id="terms_privacy_accept_button"
          class="btn btn-primary btn-lg ml-2"
          @click="acceptTnC"
          :disabled="termsLoading"
        >
          {{ $t('pages.onboarding.home.iAccept') }}
        </button>
      </div>
    </div>
    <template v-if="termsAcceptedAt">
      <AnalyticsOptInModal @goToSetup="goToSetup" />
    </template>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import LogoWallet from '@/assets/icons/logo_wallet.svg'
import AnalyticsOptInModal from '@/components/AnalyticsOptInModal.vue'
import SpinnerIcon from '@/assets/icons/spinner.svg'

export default {
  components: {
    LogoWallet,
    AnalyticsOptInModal,
    SpinnerIcon
  },
  data: function () {
    return {
      analyticsAccepted: true,
      termsLoading: true,
      termsContent: ''
    }
  },
  methods: {
    ...mapState(['termsAcceptedAt']),
    ...mapActions(['acceptTermsAndConditions', 'initializeAnalytics']),
    async acceptTnC() {
      await this.acceptTermsAndConditions({
        analyticsAccepted: this.analyticsAccepted
      })
      this.$store.dispatch('app/setAnalyticsOptInModalOpen', { open: true })
      await this.initializeAnalytics()
    },
    goToSetup() {
      this.$router.push(`/onboarding/${this.$route.query?.isImport ? 'import' : 'setup'}`)
    },
    setAnalyticsOption(accepted) {
      this.analyticsAccepted = accepted
    }
  },
  async created() {
    const locale = this.currentLocale || process.env.VUE_APP_DEFAULT_LOCALE
    const content = await import(`@/locales/${locale}/terms.html`)
    this.termsContent = content.default
    this.termsLoading = false
  }
}
</script>

<style lang="scss">
.onboading-home {
  padding: 70px 0 0 0 !important;

  a {
    color: $color-primary !important;
  }
  &_header {
    margin-bottom: 30px;

    svg {
      width: 100px;
    }
  }
  .loading-container {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
  }

  &_tnc {
    background: $color-text-secondary;
    color: $color-text-primary;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    text-align: center;
    flex-grow: 1;
    padding-top: 1.5em;

    h4 {
      font-size: 25px;
      font-weight: 600;
    }

    &__text {
      position: relative;
      padding: $wrapper-padding;
      max-height: 290px;
      overflow-y: auto;
      text-align: left;
    }

    &__actions {
      padding-bottom: 1.5em;
    }
  }
}

.modal-content {
  color: #4a4a4a;
  position: absolute;
  text-align: left;

  .analytics-optin-title {
    font-weight: 600;
    font-size: 18px;
    text-transform: uppercase;
  }

  .analytics-optin-message {
    font-style: normal;
    font-weight: 300;
    font-size: 12px;
    line-height: 16px;
    margin-bottom: 10px;
  }

  .modal-footer {
    display: block;
  }

  .analytics-optin-options {
    font-weight: 300;
    font-size: 12px;
    line-height: 18px;
    div {
      margin-top: 10px;
    }
  }
}
</style>
