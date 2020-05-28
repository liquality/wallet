<template>
  <div>
    <TradeModal
      v-if="buyAsset"
      :key="'trade:' + buyAsset"
      :asset="buyAsset"
      @buy="buy"
      @close="buyAsset = null" />
    <AssetModal
      v-if="selectedAsset"
      :key="'wallet:' + selectedAsset"
      :asset="selectedAsset"
      @close="selectedAsset = null" />
    <Summary @show="selectedAsset = $event" @buy="buyAsset = $event" />
    <History />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import cryptoassets from '@liquality/cryptoassets'

import Summary from '@/components/Summary.vue'
import History from '@/components/History'
import AssetModal from '@/components/AssetModal'
import TradeModal from '@/components/TradeModal'
import { NetworkAssets } from '../store/factory/client'

export default {
  components: {
    TradeModal,
    AssetModal,
    History,
    Summary
  },
  data () {
    return {
      selectedAsset: null,
      buyAsset: false,
      base: 'BTC'
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'marketData', 'balances']),
    walletId () {
      return this.$route.params.walletId
    },
    networkAssets () {
      return NetworkAssets[this.activeNetwork]
    }
  },
  methods: {
    ...mapActions(['newSwap']),
    async buy ({ agent, from, to, amount, sendTo, auto }) {
      const fromAmount = cryptoassets[from.toLowerCase()].currencyToUnit(amount)

      await this.newSwap({
        network: this.activeNetwork,
        walletId: this.walletId,
        agent,
        from,
        to,
        fromAmount,
        sendTo,
        auto
      })

      this.autoAsset = null
      this.buyAsset = null
    }
  }
}
</script>

<style lang="scss">
.balance-box {
  .card + .card {
    margin-left: 1.5rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;

    .card + .card {
      margin-left: 0!important;
      margin-top: 1.5rem!important;
    }
  }
}

.asset-icon {
  display: inline-block;
  vertical-align: middle;
  height: 30px;
  width: 30px;
  margin-right: 10px;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: contain;
  transform-origin: center;
  transition: all 0.2s ease-out;

  & + span {
    vertical-align: middle;
  }
}
</style>
