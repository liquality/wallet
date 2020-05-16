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
import { mapGetters } from 'vuex'
import LogoWallet from '@/assets/icons/logo_wallet.svg'

export default {
  components: {
    LogoWallet
  },
  data () {
    return {
      password: null,
      name: null
    }
  },
  computed: {
    ...mapGetters(['client'])
  },
  methods: {
    async unlock () {
      try {
        const { id, name } = await this.client('wallet')('unlock')(this.walletId, this.password)
        this.$router.replace('/wallet')
      } catch (e) {
        this.password = null
      }
    },
    async lock () {
      await this.client('wallet')('lock')()
    }
  },
  async created () {
    const wallets = await this.client('wallet')('getListOfWallets')()
    const id = wallets[0].id
    const { name } = await this.client('wallet')('getWallet')(id)
    this.walletId = id
    this.name = name
  },
  beforeDestroy () {
    this.lock()
  }
}
</script>

<style lang="scss">
.unlock-wallet {
  
}
</style>
