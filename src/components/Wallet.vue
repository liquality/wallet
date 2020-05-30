<template>
  <div>
    <TradeModal
      v-if="buyAsset"
      :key="'trade:' + buyAsset"
      :asset="buyAsset"
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
import Summary from '@/components/Summary.vue'
import History from '@/components/History'
import AssetModal from '@/components/AssetModal'
import TradeModal from '@/components/TradeModal'

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
      buyAsset: null
    }
  }
}
</script>

<style lang="scss">
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
