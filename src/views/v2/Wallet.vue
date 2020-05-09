<template>
  <div class='wallet'>
    <div class='wallet_filler'></div>
    <AccountItem asset="BTC" v-bind:balance="5.5123123" />
    <AccountItem asset="ETH" v-bind:balance="12.51423" />
    <AccountItem asset="DAI" v-bind:balance="8212" />
    <AccountItem asset="USDC" v-bind:balance="9333" />
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
  &_filler {
    width: 100%;
    height: 200px;
    background: $brand-gradient;
  }
}
</style>
