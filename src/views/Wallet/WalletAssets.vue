<template>
  <WalletAccounts @item-selected="onAccountSelected" :accounts="accountsData" />
</template>

<script>
import { mapGetters } from 'vuex'
import WalletAccounts from '@/components/WalletAccounts'

export default {
  // created() {
  //   console.log('WalletAccounts accountsData', this.accountsData)
  // },
  computed: {
    ...mapGetters(['accountsData'])
  },
  components: {
    WalletAccounts
  },
  methods: {
    onAccountSelected({ account, asset }) {
      const _asset = asset || account.assets[0]
      this.$router.push(`/accounts/${account.id}/${_asset}`)
    }
  }
}
</script>
<style lang="scss"></style>
