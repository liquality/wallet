<template>
  <div class="liqualitybost-swap-details uniswap-swap-details">
    <div class="row"><div class="col">Slippage: {{ slippagePercent }}% </div></div>
    <div class="row" v-if="item.fromFundHash"><div class="col">Wallet Inititation Transaction: <a :href="getExplorerLink(item.fromFundHash, item.from)" target="_blank">{{ item.fromFundHash }}</a></div></div>
    <div class="row" v-if="item.toFundHash"><div class="col">Liquality Inititation Transaction: <a :href="getExplorerLink(item.toFundHash, item.bridgeAsset)" target="_blank">{{ item.toFundHash }}</a></div></div>
    <div class="row" v-if="item.toClaimHash"><div class="col">Wallet Claim Transaction: <a :href="getExplorerLink(item.toClaimHash, item.bridgeAsset)" target="_blank">{{ item.toClaimHash }}</a></div></div>
    <div class="row" v-if="item.swapTxHash"><div class="col">1inch Swap Transaction: <a :href="getExplorerLink(item.swapTxHash, item.bridgeAsset)" target="_blank">{{ item.swapTxHash }}</a></div></div>
    <div class="row" v-if="item.refundHash"><div class="col">Refund Transaction: <a :href="getExplorerLink(item.refundHash, item.from)" target="_blank">{{ item.refundHash }}</a></div></div>
    <div class="text-muted text-center small-12">Actions</div>
    <div class="text-danger text-center">
      <span class="cursor-pointer mr-3" v-if="item.error" @click="$emit('retrySwap')">Retry</span>
    </div>
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
  props: ['id', 'retrySwap'],
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
    getExplorerLink (hash, chain) {
      return getTransactionExplorerLink(hash, chain, this.activeNetwork)
    }
  }
}
</script>

<style lang="scss">
.uniswap-swap-details {
}
</style>
