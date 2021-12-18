<template>
  <div class="unlock-wallet login-wrapper">
    <div class="login-header">
      <LogoWalletMain />
    </div>
    <div class="wallet-title-container">
      <NewWalletText class="mb-4"/>
    </div>
    <form class="form d-flex flex-column h-100" autocomplete="off" @submit.prevent="unlock">
      <div class="form-group">
        <label for="password">Password</label>
        <div class="input-group">
          <input type="password" class="form-control" id="password" v-model="password" autocomplete="off" required :readonly="loading">
        </div>
        <p v-if="error" class="mt-3" id="password_error">
          {{ error }}
        </p>
      </div>
      <div class="footer-container">
        <p><router-link :to="{path: '/onboarding/import', query: {isNewUser: false}}" id="forgot_password_import_seed">Forgot password? Import with seed phrase</router-link></p>
        <div class="footer-content">
          <button class="btn btn-primary btn-lg btn-block btn-icon"
                  id="unlock_button"
                  :disabled="loading">
            <span v-if="loading">
              <SpinnerIcon /> &nbsp;
            </span>
            <template v-else>Unlock</template>
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

export default {
  components: {
    LogoWalletMain,
    SpinnerIcon,
    NewWalletText
  },
  data () {
    return {
      loading: false,
      error: null,
      password: ''
    }
  },
  methods: {
    ...mapActions(['unlockWallet']),
    async unlock () {
      this.error = null
      this.loading = true
      try {
        await this.unlockWallet({ key: this.password })
        this.$emit('unlocked')
      } catch (e) {
        console.log(e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss">

</style>
