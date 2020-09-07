<template>
  <div class="wallet">
    <NavBar showMenu="true">
      <strong>{{wallet.name}}</strong> <span class="text-muted">({{activeNetwork}})</span>
    </NavBar>
    <div class="wallet_stats">
      <div v-if="networkAssetsLoaded">
        <div><span class="wallet_stats_total">{{totalFiatBalance}}</span><span>USD</span></div>
        <span>{{assetsWithBalance.length}} Asset{{ assetsWithBalance.length === 1 ? '' : 's' }}</span>
      </div>
      <span v-else>Loading ...</span>
    </div>
    <div class="wallet_accounts" v-if="networkWalletBalances">
      <router-link v-for="([asset, balance]) in orderedBalances" :key="asset" v-bind:to="'/account/' + asset" >
        <div class="account-item d-flex align-items-center">
          <img :src="'./img/' + asset.toLowerCase() + '.png'" class="account-item_icon" />
          <div class="account-item_name flex-fill">{{asset}}</div>
          <div class="account-item_balance">
            {{prettyBalance(balance, asset)}} {{asset}}
            <span class="account-item_balance_fiat">${{prettyFiat(balance, asset)}}</span>
          </div>
          <ChevronRightIcon class="account-item_chevron" />
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import BN from 'bignumber.js'
import { mapState, mapActions } from 'vuex'
import { NetworkAssets } from '@/store/factory/client'
import cryptoassets from '@liquality/cryptoassets'
import { prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import NavBar from '@/components/NavBar.vue'
import ChevronRightIcon from '@/assets/icons/chevron_right.svg'

export default {
  components: {
    NavBar,
    ChevronRightIcon
  },
  computed: {
    ...mapState(['activeNetwork', 'balances', 'activeWalletId', 'wallets', 'fiatRates']),
    wallet: function () {
      return this.wallets.find(wallet => wallet.id === this.activeWalletId)
    },
    networkWalletBalances () {
      if (!this.balances[this.activeNetwork]) return false
      if (!this.balances[this.activeNetwork][this.activeWalletId]) return false

      return this.balances[this.activeNetwork][this.activeWalletId]
    },
    orderedBalances () {
      const assets = NetworkAssets[this.activeNetwork]
      return Object.entries(this.networkWalletBalances).sort((a, b) => {
        return assets.indexOf(a[0]) - assets.indexOf(b[0])
      })
    },
    assetsWithBalance () {
      return this.orderedBalances.filter(([asset, balance]) => balance > 0)
    },
    networkAssetsLoaded () {
      return this.networkWalletBalances && NetworkAssets[this.activeNetwork].length === Object.keys(this.networkWalletBalances).length
    },
    totalFiatBalance () {
      const total = this.assetsWithBalance.reduce((accum, [asset, balance]) => {
        balance = cryptoassets[asset.toLowerCase()].unitToCurrency(balance)
        const balanceFiat = this.fiatRates[asset] ? BN(balance).times(this.fiatRates[asset]) : 0
        return accum.plus(balanceFiat)
      }, BN(0))
      return total.toFormat(2)
    }
  },
  methods: {
    ...mapActions(['changeActiveWalletId']),
    prettyBalance,
    prettyFiat (amount, asset) {
      amount = cryptoassets[asset.toLowerCase()].unitToCurrency(amount)
      return prettyFiatBalance(amount, this.fiatRates[asset])
    }
  }
}
</script>

<style lang="scss">
.wallet {
  display: flex;
  flex-direction: column;
  min-height: 0;

  &_stats {
    text-align: center;
    display: flex;
    width: 100%;
    height: 200px;
    justify-content: center;
    align-items: center;
    background: url('../assets/bg/asset_list.svg?inline'), $brand-gradient-primary;
    color: $color-text-secondary;
    font-size: $font-size-lg;

    &_total {
      font-size: $h1-font-size;
      line-height: $h1-font-size;
      margin-right: 10px;
    }
  }

  &_accounts {
    overflow-y: auto;
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
    position: relative;
    width: 120px;
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
    margin-bottom: 2px;
  }
}
</style>
