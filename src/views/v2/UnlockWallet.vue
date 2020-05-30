<template>
  <div class="unlock-wallet login-wrapper">
    <div class="login-header">
      <LogoWallet />
    </div>
    <div>
      <h2>Open your wallet</h2>
    </div>
    <div>
      <form class="form" autocomplete="off" v-on:submit.prevent="unlock">
        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-group">
            <input type="password" class="form-control" id="password" v-model="password" autocomplete="off" required>
          </div>
        </div>
        <p><button class="btn btn-light btn-lg btn-block btn-icon" type="submit">Unlock</button></p>
        <p><router-link to="/"><button class="btn btn-primary btn-lg btn-block btn-icon">Cancel</button></router-link></p>
        <p>Forgot password? Import with seed phrase</p>
      </form>
    </div>
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
      password: null
    }
  },
  methods: {
    ...mapActions(['unlockWallet']),
    async unlock () {
      await this.unlockWallet({ key: this.password })
      this.$router.replace('/wallet')
    }
  }
}
</script>

<style lang="scss">
.unlock-wallet {
  
}
</style>
