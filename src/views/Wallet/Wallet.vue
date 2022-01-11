<template>
  <div class="wallet">
    <NavBar showMenu="true">
      <span class="wallet-header">
        <strong>Overview</strong>
          <span class="text-muted" id="active_network">
            ({{ activeNetwork }})
          </span>
      </span>
    </NavBar>
    <InfoNotification v-if="showLedgerRequest">
      <LedgerRequestMessage :item="ledgerItem" />
    </InfoNotification>
    <div class="wallet-content">
      <WalletStats />
      <AssetsChart />
      <WalletTabs />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { isERC20 } from '@/utils/asset'
import AssetsChart from './AssetsChart.vue'
import NavBar from '@/components/NavBar.vue'
import InfoNotification from '@/components/InfoNotification.vue'
import LedgerRequestMessage from '@/components/LedgerRequestMessage.vue'
import WalletStats from './WalletStats.vue'
import WalletTabs from './WalletTabs.vue'

export default {
  components: {
    AssetsChart,
    NavBar,
    WalletStats,
    WalletTabs,
    InfoNotification,
    LedgerRequestMessage
  },
  async created () {
    try {
      await this.updateBalances(
        {
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          loadingInitialBalance: true
        }
      )
    } catch (error) {
      // TODO: manage error
      console.error(error)
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'history']),
    ...mapGetters(['accountItem']),
    ledgerItem () {
      return this.history[this.activeNetwork]?.[this.activeWalletId]?.find((item) => this.ledgerSignRequired(item))
    },
    showLedgerRequest () {
      return this.ledgerItem
    }
  },
  methods: {
    ...mapActions(['updateBalances']),
    ledgerSignRequired (item) {
      if (item && item.fromAccountId && item.toAccountId) {
      // Check the status and get the account related
        if (item.status === 'INITIATION_CONFIRMED') {
        // fund transaction only apply for erc20
          if (isERC20(item.from)) {
            const fromAccount = this.accountItem(item.fromAccountId)
            if (fromAccount?.type.includes('ledger')) {
              return true
            }
          }
        } else if (item.status === 'READY_TO_CLAIM') {
          const toAccount = this.accountItem(item.toAccountId)
          if (toAccount?.type.includes('ledger')) {
            return true
          }
        } else if (item.status === 'GET_REFUND') {
          const fromAccount = this.accountItem(item.fromAccountId)
          if (fromAccount?.type.includes('ledger')) {
            return true
          }
        }
      }

      return false
    }
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
