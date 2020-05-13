<template>
  <div class="wallet">
    <div class="wallet_stats">4 Assets</div>
    <div class="wallet_accounts">
      <router-link to="/account/btc"><AccountItem asset="BTC" v-bind:balance="5.5123123" /></router-link>
      <router-link to="/account/btc"><AccountItem asset="ETH" v-bind:balance="12.51423" /></router-link>
      <router-link to="/account/btc"><AccountItem asset="DAI" v-bind:balance="8212" /></router-link>
      <router-link to="/account/btc"><AccountItem asset="USDC" v-bind:balance="9333" /></router-link>
    </div>
  </div>
</template>

<script>
import AccountItem from '@/components/v2/AccountItem'

export default {
  components: {
    AccountItem
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
