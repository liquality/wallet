<template>
  <div class="wallet">
    <div class="wallet_stats">4 Assets</div>
    <div class="wallet_accounts" v-if="networkWalletBalances">
      <router-link v-for="(balance, asset) in networkWalletBalances" :key="asset" v-bind:to="'/account/' + asset" >
        <AccountItem v-bind:asset="asset" v-bind:balance="balance" />
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { NetworkAssets } from '@/store/factory/client'
import AccountItem from '@/components/v2/AccountItem'

export default {
  components: {
    AccountItem
  },
  computed: {
    ...mapState(['activeNetwork', 'balances', 'activeWalletId', 'wallets']),
    networkAssets () {
      return NetworkAssets[this.activeNetwork]
    },
    networkWalletBalances () {
      if (!this.balances[this.activeNetwork]) return false
      if (!this.balances[this.activeNetwork][this.activeWalletId]) return false

      return this.balances[this.activeNetwork][this.activeWalletId]
    }
  },
  methods: {
    ...mapActions(['changeActiveWalletId', 'updateBalances'])
  },
  async created () {
    await this.changeActiveWalletId({ walletId: this.wallets[0].id })
    this.updateBalances({ network: this.activeNetwork, walletId: this.activeWalletId })
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
</style>
