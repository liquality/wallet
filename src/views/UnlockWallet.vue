<template>
  <div class="unlock-wallet login-wrapper">
    <div class="login-header">
      <LogoWalletMain />
    </div>
    <div class="wallet-title-container">
      <NewWalletText class="mb-4" />
    </div>
    <form class="form d-flex flex-column h-100" autocomplete="off" @submit.prevent="unlock">
      <div class="form-group">
        <label for="password">
          {{ $t('common.password') }}
        </label>
        <div class="input-group">
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="password"
            autocomplete="off"
            required
            :readonly="loading"
          />
        </div>
        <p v-if="error" class="mt-3" id="password_error">
          {{ error }}
        </p>
      </div>
      <div class="footer-container">
        <p>
          <router-link
            :to="{ path: '/onboarding/home', query: { isImport: true } }"
            id="forgot_password_import_seed"
            >{{ $t('pages.unlockWallet.forgotPassword') }}</router-link
          >
        </p>
        <div class="footer-content">
          <button
            class="btn btn-primary btn-lg btn-block btn-icon"
            id="unlock_button"
            :disabled="loading"
          >
            <span v-if="loading"> <SpinnerIcon /> &nbsp; </span>
            <template v-else>{{ $t('pages.unlockWallet.unlock') }}</template>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import LogoWalletMain from '@/assets/icons/logo_wallet_main.svg'
import NewWalletText from '@/assets/icons/wallet_tagline.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { version as walletVersion } from '../../package.json'
import { errorToLiqualityErrorString } from '@liquality/error-parser/dist/src/utils'
import { reportLiqualityError } from '@liquality/error-parser/dist/src/reporters/index'

export default {
  components: {
    LogoWalletMain,
    SpinnerIcon,
    NewWalletText
  },
  data() {
    return {
      loading: false,
      error: null,
      password: ''
    }
  },
  methods: {
    ...mapActions('app', ['trackAnalytics']),
    ...mapActions(['unlockWallet']),
    async unlock() {
      this.error = null
      this.loading = true
      try {
        await this.unlockWallet({ key: this.password })
        this.$emit('unlocked')
        this.trackAnalytics({
          event: 'UnlockWallet',
          properties: {
            walletVersion,
            action: 'User unlocked wallet successfully'
          }
        })
      } catch (e) {
        reportLiqualityError(e)
        this.error = this.$tle(errorToLiqualityErrorString(e))
        this.trackAnalytics({
          event: 'UnlockWallet failed',
          properties: {
            walletVersion,
            action: 'User failed to unlock wallet',
            label: e.message
          }
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss"></style>
