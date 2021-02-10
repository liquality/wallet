<template>
  <div class="wallet">
    <NavBar showMenu="true">
      <span class="wallet-header">
        <strong>Overview</strong>
          <span class="text-muted">
            ({{ activeNetwork }})
          </span>
      </span>
    </NavBar>
    <div class="wallet-content">
      <WalletStats :loading="loadingBalances"/>
      <AssetsChart />
      <WalletTabs :loading="loadingBalances"/>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import AssetsChart from './AssetsChart.vue'
import NavBar from '@/components/NavBar.vue'
import WalletStats from './WalletStats.vue'
import WalletTabs from './WalletTabs.vue'

export default {
  components: {
    AssetsChart,
    NavBar,
    WalletStats,
    WalletTabs
  },
  data () {
    return {
      loadingBalances: false
    }
  },
  async created () {
    this.loadingBalances = true
    try {
      await this.updateBalances(
        {
          network: this.activeNetwork,
          walletId: this.activeWalletId
        }
      )
    } catch (error) {
      // TODO: manage error
      console.error(error)
    } finally {
      this.loadingBalances = false
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId']),
    ...mapGetters(['accountsData'])
  },
  methods: {
    ...mapActions(['updateBalances'])
  }
}
</script>

<style lang="scss">
.wallet {
  display: flex;
  flex-direction: column;
  height: 600px;
  padding-bottom: 44px;

  .wallet-content {
     overflow: auto;
   }

  .wallet-header {
    font-weight: normal;
    text-transform: uppercase;
  }
}
</style>
