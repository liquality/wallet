<template>
  <Lazy>
    <WalletAccounts @item-selected="onAccountSelected" :accounts="accountsData" />
  </Lazy>
</template>

<script>
import { mapGetters } from 'vuex'
import WalletAccounts from '@/components/WalletAccounts'
import Lazy from '@/components/Lazy.vue'

export default {
  computed: {
    ...mapGetters(['accountsData'])
  },
  components: {
    Lazy,
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
