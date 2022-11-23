<template>
  <div class="account-container">
    <NavBar :showMenu="false">
      <span class="account-title"> Wallet Connect </span>
    </NavBar>
    <div class="wallet-tab-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import NavBar from '@/components/NavBar'

export default {
  components: {
    NavBar
  },
  data() {
    return {
      uri: null
    }
  },
  computed: {
  },
  methods: {
    ...mapActions('app', ['initializeSignClient'])
  },
  async created() {
    await this.initializeSignClient()
    if (this.$route.query.uri) {
      const uri = encodeURIComponent(this.$route.query.uri)
      await this.$router.replace({ name: 'WalletConnectPair', query: { uri } })
    }
  }
}
</script>

<style lang="scss"></style>
