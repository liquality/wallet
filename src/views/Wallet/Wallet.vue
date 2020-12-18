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
      <WalletStats />
      <AssetsChart />
      <WalletTabs />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
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
  computed: {
    ...mapState(['activeNetwork'])
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
