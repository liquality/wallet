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
    <InfoNotification v-if="showLedgerRequest">
      <LedgerRequestMessage :item="ledgerItem" />
    </InfoNotification>
    <div class="wallet-content">
      <WalletStats :loading="loadingBalances"/>
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
import { v4 as uuidv4 } from 'uuid'
import Analytics from 'analytics'
import segmentPlugin from '@analytics/segment'

const analytics = Analytics({
  app: 'liq-test',
  plugins: [
    segmentPlugin({
      writeKey: '3jTItMqoo8OuN1gJ6MljKOIsrDjqIZo7'
    })
  ]
})

export default {
  components: {
    AssetsChart,
    NavBar,
    WalletStats,
    WalletTabs,
    InfoNotification,
    LedgerRequestMessage
  },
  data () {
    return {
      loadingBalances: false
    }
  },
  beforeCreate () {
    const id = uuidv4()
    // eslint-disable-next-line no-undef
    analytics.identify(id, {
      name: 'Bradley Suira'
    })
  },
  async created () {
    // eslint-disable-next-line no-undef
    analytics.track('Wallet Unlock', {
      component: 'Wallet'
    }, () => {
      console.log('analytics called')
    })
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
