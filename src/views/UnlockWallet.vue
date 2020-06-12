<template>
  <div class="unlock-wallet login-wrapper">
    <div class="login-header">
      <LogoWallet />
    </div>
    <div>
      <h2>Open your wallet</h2>
    </div>
    <form class="form" autocomplete="off" v-on:submit.prevent="unlock">
      <div class="form-group">
        <label for="password">Password</label>
        <div class="input-group">
          <input type="password" class="form-control" id="password" v-model="password" autocomplete="off" required>
        </div>
        <p v-if="errors.length">
          <b>Please correct the following error(s):</b>
          <ul>
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>
        </p>
      </div>
      <p><router-link to="/onboarding/import">Forgot password? Import with seed phrase</router-link></p>
      <p><button class="btn btn-light btn-lg btn-block btn-icon" type="submit">Unlock</button></p>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import LogoWallet from '@/assets/icons/logo_wallet.svg'

export default {
  components: {
    LogoWallet
  },
  data () {
    return {
      errors: [],
      password: null
    }
  },
  methods: {
    ...mapActions(['unlockWallet']),
    async unlock () {
      this.errors = []
      try {
        await this.unlockWallet({ key: this.password })
        this.$router.replace('/wallet')
      } catch (e) {
        console.log(e)
        this.errors.push(e.message)
      }
    }
  }
}
</script>

<style lang="scss">
.unlock-wallet {

}
</style>
