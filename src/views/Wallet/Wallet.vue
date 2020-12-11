<template>
  <div class="wallet">
    <NavBar showMenu="true">
      <span class="wallet_header">
        <strong>Overview</strong>
          <span class="text-muted">
            ({{activeNetwork}})
          </span>
      </span>
    </NavBar>

    <WalletStats :loaded="networkAssetsLoaded"
                 :assets="assetsWithBalance"
                 :fiat-rates="fiatRates" />

    <InfoNotification v-if="ethRequired">
      <EthRequiredMessage />
    </InfoNotification>

    <div v-else class="wallet-divider"></div>
    <WalletTabs />

    <div class="wallet-tab-content" v-if="networkWalletBalances">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import NavBar from '@/components/NavBar.vue'
import InfoNotification from '@/components/InfoNotification'
import EthRequiredMessage from '@/components/EthRequiredMessage'
import WalletStats from './Stats.vue'
import WalletTabs from './Tabs.vue'

export default {
  components: {
    NavBar,
    InfoNotification,
    EthRequiredMessage,
    WalletStats,
    WalletTabs
  },
  computed: {
    ...mapState(['activeNetwork', 'balances', 'activeWalletId', 'enabledAssets', 'fiatRates']),
    ...mapGetters(['orderedBalances', 'networkAssets']),
    networkWalletBalances () {
      if (!this.balances[this.activeNetwork]) return false
      if (!this.balances[this.activeNetwork][this.activeWalletId]) return false

      return this.balances[this.activeNetwork][this.activeWalletId]
    },
    ethRequired () {
      return this.networkWalletBalances.ETH === 0
    },
    assetsWithBalance () {
      return this.orderedBalances.filter(([asset, balance]) => balance > 0)
    },
    networkAssetsLoaded () {
      return this.networkWalletBalances && Object.keys(this.networkWalletBalances).length >= this.networkAssets.length
    }
  }
}
</script>

<style lang="scss">
.wallet {
  display: flex;
  flex-direction: column;
  min-height: 0;

  &_header {
    font-weight: normal;
    text-transform: uppercase;
  }

  .wallet-tab-content {
    overflow-y: auto;
    a {
      color: $color-text-primary;
    }
    a:hover {
      text-decoration: none;
    }
  }

  .wallet-divider {
    width: 100%;
    height: 9px;
    border-top: 1px solid #D9DFE5;
    background:  linear-gradient( #EAB300, #EAB300),
    linear-gradient( #627EEA, #627EEA),
    linear-gradient( #F7CA4F, #F7CA4F),
    linear-gradient( #53AE94, #53AE94),
    linear-gradient( #3186E0, #3186E0),
    linear-gradient( #E99F50, #E99F50);

    background-size: 25% 100%,
                     55% 100%,
                     70% 100%,
                     77% 100%,
                     91% 100%,
                     100% 100%;

    background-repeat: no-repeat;
  }
}

.account-item {
  width: 100%;
  border-bottom: 1px solid $hr-border-color;
  height: 60px;
  padding: 16px 30px;

  &:hover {
    cursor: pointer;
    text-decoration: none;
  }

  &_icon {
    margin-right: 8px;
  }

  &_balance {
    position: relative;
    text-align: right;
    margin-right: 20px;

    &_fiat {
      display: block;
      position: absolute;
      right: 0;
      top: 18px;
      font-size: $font-size-tiny;
      color: $text-muted;
    }
  }

  &_chevron {
    width: 6px;
    margin-bottom: 2px;
  }
}
</style>
