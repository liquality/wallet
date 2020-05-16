<template>
  <div class="create-wallet login-wrapper">
    <div class="login-header">
      <LogoWallet />
    </div>
    <div>
      <h2>Create your wallet</h2>
    </div>
    <form class="form" autocomplete="off" v-on:submit.prevent="generate">
      <div class="form-group">
        <label for="name">Wallet Name</label>
        <div class="input-group">
          <input type="text" class="form-control" id="name" v-model="name" autocomplete="off" required>
        </div>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <div class="input-group">
          <input type="password" class="form-control" id="password" v-model="password" autocomplete="off" required>
        </div>
        <small class="form-text">You need this password to unlock your wallet.</small>
      </div>
              <p><button class="btn btn-light btn-lg btn-block btn-icon" type="submit">Generate seed phrase</button></p>
      <p><router-link to="/"><button class="btn btn-primary btn-lg btn-block btn-icon">Cancel</button></router-link></p>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import LogoWallet from '@/assets/icons/logo_wallet.svg'

export default {
  components: {
    LogoWallet
  },
  computed: {
    ...mapGetters(['client'])
  },
  methods: {
    async generate () {
      const { id, name, wallet } = await this.client('wallet')('generate')(this.name, this.password)

      this.$router.replace({ name: 'Backup', params: {name, seed: wallet } })
    }
  }
}
</script>

<style lang="scss">
.create-wallet {

}
</style>
