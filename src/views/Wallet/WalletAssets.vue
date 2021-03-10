<template>
  <WalletAccounts @item-selected="onAccountSelected" />
</template>

<script>
import WalletAccounts from '@/components/WalletAccounts'

export default {
  components: {
    WalletAccounts
  },
  methods: {
    onAccountSelected ({ account, asset }) {
      const _asset = asset || account.assets[0]
      this.$router.push(`/accounts/${account.id}/${_asset}`)
    }
  }
}
</script>
<style lang="scss">
</style>
