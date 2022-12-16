<template>
  <div class="wallet">
    <NavBar showMenu="true">
      <span class="wallet-header">
        <strong>{{ $t('common.overview') }}</strong>
        <span class="text-muted" id="active_network"> ({{ activeNetwork }}) </span>
      </span>
    </NavBar>
    <InfoNotification v-if="showLedgerRequest">
      <LedgerRequestMessage :item="ledgerItem" />
    </InfoNotification>
    <div class="wallet-content">
      <NFTStats v-if="isNFTPage" />
      <WalletStats v-else />
      <WalletTabs />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { isERC20 } from '@liquality/wallet-core/dist/src/utils/asset'
import NavBar from '@/components/NavBar.vue'
import WalletStats from './WalletStats.vue'
import WalletTabs from './WalletTabs.vue'
import NFTStats from './NFTStats'
import { reportLiqualityError } from '@liquality/error-parser'

export default {
  components: {
    NavBar,
    WalletStats,
    NFTStats,
    WalletTabs,
    InfoNotification: () => import('@/components/InfoNotification.vue'),
    LedgerRequestMessage: () => import('@/components/LedgerRequestMessage.vue')
  },
  async mounted() {
    try {
      await Promise.all([
        this.updateBalances({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          loadingInitialBalance: true
        }),
        this.getNFTs()
      ])
    } catch (error) {
      // TODO: manage error
      reportLiqualityError(error)
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'history']),
    ...mapGetters(['accountItem', 'accountsData']),
    isNFTPage() {
      return this.$route.path === '/wallet/nfts'
    },
    ledgerItem() {
      return this.history[this.activeNetwork]?.[this.activeWalletId]?.find((item) =>
        this.ledgerSignRequired(item)
      )
    },
    showLedgerRequest() {
      return this.ledgerItem
    }
  },
  methods: {
    ...mapActions(['updateBalances', 'updateNFTs']),
    ledgerSignRequired(item) {
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
    },
    async getNFTs() {
      const accountIds = this.accountsData.map((account) => {
        return account.id
      })
      try {
        await this.updateNFTs({
          walletId: this.activeWalletId,
          network: this.activeNetwork,
          accountIds: accountIds
        })
      } catch (error) {
        reportLiqualityError(error)
      }
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

  strong {
    font-weight: 600;
  }

  .wallet-content {
    overflow: auto;
  }

  .wallet-header {
    font-weight: normal;
    text-transform: uppercase;
  }
}
</style>
