<template>
  <WalletAccounts @item-selected="onAccountSelected" :accounts="accountsData" />
</template>

<script>
import { mapGetters } from 'vuex'
import WalletAccounts from '@/components/WalletAccounts'
import { escapeSpecialSymbolsURL } from '@/utils/asset'

export default {
  computed: {
    ...mapGetters(['accountsData'])
  },
  components: {
    WalletAccounts
  },
  methods: {
    onAccountSelected({ account, asset }) {
      const _asset = escapeSpecialSymbolsURL(asset || account.assets[0])
      this.$router.push(`/accounts/${account.id}/${_asset}`)
    }
  }
}
</script>
<style lang="scss"></style>
