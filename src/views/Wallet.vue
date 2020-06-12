<template>
  <div class="wallet">
    <div class="wallet_stats">
      <span v-if="networkAssetsLoaded">{{Object.keys(networkWalletBalances).length}} Assets</span>
      <span v-else>Loading ...</span>
    </div>
    <div class="wallet_accounts" v-if="networkWalletBalances">
      <router-link v-for="(balance, asset) in networkWalletBalances" :key="asset" v-bind:to="'/account/' + asset" >
        <div class="account-item d-flex align-items-center">
          <img :src="'./img/' + asset.toLowerCase() + '.png'" class="account-item_icon" />
          <div class="account-item_name flex-fill">{{asset}}</div>
          <div class="account-item_balance">{{prettyBalance(balance, asset)}} {{asset}}</div>
          <ChevronRightIcon class="account-item_chevron" />
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { NetworkAssets } from '@/store/factory/client'
import { prettyBalance } from '@/utils/coinFormatter'
import ChevronRightIcon from '@/assets/icons/chevron_right.svg'

export default {
  components: {
    ChevronRightIcon
  },
  computed: {
    ...mapState(['activeNetwork', 'balances', 'activeWalletId', 'wallets']),
    networkWalletBalances () {
      if (!this.balances[this.activeNetwork]) return false
      if (!this.balances[this.activeNetwork][this.activeWalletId]) return false

      return this.balances[this.activeNetwork][this.activeWalletId]
    },
    networkAssets () {
      return NetworkAssets[this.activeNetwork]
    },
    networkAssetsLoaded () {
      return this.networkWalletBalances && this.networkAssets.length === Object.keys(this.networkWalletBalances).length
    }
  },
  methods: {
    ...mapActions(['changeActiveWalletId']),
    prettyBalance
  }
}
</script>

<style lang="scss">
.wallet {
  &_stats {
    display: flex;
    width: 100%;
    height: 200px;
    justify-content: center;
    align-items: center;
    background: $brand-gradient-primary;
    color: $color-text-secondary;
    font-size: $font-size-lg;
  }

  &_accounts {
    a {
      color: $color-text-primary;
    }
    a:hover {
      text-decoration: none;
    }
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
    width: 28px;
    height: 28px;
    margin-right: 8px;
  }

  &_balance {
    width: 120px;
    text-align: right;
    margin-right: 20px;
  }

  &_chevron {
    margin-bottom: 2px;
  }
}
</style>
