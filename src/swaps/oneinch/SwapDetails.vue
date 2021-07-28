<template>
  <div class="oneinch-swap-details uniswap-swap-details">
    <div class="row"><div class="col">Slippage: {{ slippagePercent }}% </div></div>
    <div class="row" v-if="item.approveTxHash"><div class="col">Approval Transaction: <a :href="getExplorerLink(item.approveTxHash)" target="_blank">{{ item.approveTxHash }}</a></div></div>
    <div class="row" v-if="item.swapTxHash"><div class="col">Swap Transaction: <a :href="getExplorerLink(item.swapTxHash)" target="_blank">{{ item.swapTxHash }}</a></div></div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import { getTransactionExplorerLink } from '@/utils/asset'

export default {
  data () {
    return {
    }
  },
  props: ['id'],
  computed: {
    ...mapGetters(['client', 'accountItem']),
    ...mapState(['activeWalletId', 'activeNetwork', 'balances', 'history', 'fees']),
    item () {
      return this.history[this.activeNetwork][this.activeWalletId]
        .find((item) => item.id === this.id)
    },
    slippagePercent () {
      return this.item.slippage / 100
    }
  },
  methods: {
    ...mapActions([]),
    getExplorerLink (hash) {
      return getTransactionExplorerLink(hash, this.item.from, this.activeNetwork)
    }
  }
}
</script>

<style lang="scss">
.uniswap-swap-details {
}
</style>
