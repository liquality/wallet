<template>
  <div class="unlock-wallet login-wrapper">
    <div class="login-header">
      <LogoWallet />
    </div>
    <div>
      <h2>Open your wallet</h2>
    </div>
    <form class="form d-flex flex-column h-100" autocomplete="off" @submit.prevent="unlock">
      <div class="form-group">
        <label for="password">Password</label>
        <div class="input-group">
          <input type="password" class="form-control" id="password" v-model="password" autocomplete="off" required :readonly="loading">
        </div>
        <p v-if="errors.length">
          <b>Please correct the following error(s):</b>
          <ul>
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>
        </p>
      </div>
      <div class="login-footer">
        <p><router-link to="/onboarding/import">Forgot password? Import with seed phrase</router-link></p>
        <div class="footer-content">
          <button class="btn btn-light btn-lg btn-block btn-icon"
                  :disabled="loading">
            <SpinnerIcon v-if="loading" />
            <template v-else>Unlock</template>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import LogoWallet from '@/assets/icons/logo_wallet.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'

export default {
  components: {
    LogoWallet,
    SpinnerIcon
  },
  data () {
    return {
      loading: false,
      errors: [],
      password: null
    }
  },
  methods: {
    ...mapActions(['unlockWallet']),
    async unlock () {
      this.errors = []
      this.loading = true
      try {
        await this.unlockWallet({ key: this.password })
        this.$router.replace('/wallet')
      } catch (e) {
        console.log(e)
        this.errors.push(e.message)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss">

</style>
