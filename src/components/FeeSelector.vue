<template>
<div class="fee-selector">
    <div class="btn-group btn-group-toggle" data-toggle="buttons">
    <label class="btn btn-option btn-option-lg"
        v-for="name in ['slow', 'average', 'fast']" :key="name"
           :id="name"
        :class="{ active: (name === value)}"
        v-tooltip="{ content: getTooltip(name) }"
        @click="$emit('input', name)">
        <input type="radio" name="fee" autocomplete="off" :checked="name === value"> {{name}}
    </label>
  </div>
  <button id="custom_network_speed_button" class="btn btn-link" @click="$emit('custom-selected', asset)">
    Custom
  </button>
</div>
</template>

<script>
import BN from 'bignumber.js'
import { prettyFiatBalance } from '@/utils/coinFormatter'
import { getNativeAsset, getFeeAsset } from '@/utils/asset'
import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'

export default {
  props: [
    'asset',
    'value',
    'fees',
    'totalFees',
    'fiatRates',
    'swap'
  ],
  methods: {
    getTooltip (name) {
      let content = '<div class="text-right">'
      if (this.fees[name].wait) {
        content += `${this.fees[name].wait} sec<br />`
      }

      const nativeAsset = this.swap ? getNativeAsset(this.asset) : getFeeAsset(this.asset) || getNativeAsset(this.asset)
      if (this.totalFees && name in this.totalFees) {
        const total = this.totalFees[name]
        const totalFiat = prettyFiatBalance(total, this.fiatRates[nativeAsset])
        content += `${BN(total).dp(6)} ${nativeAsset}`
        content += `<br />${totalFiat} USD`
      } else {
        const chainId = cryptoassets[this.asset].chain
        const { unit } = chains[chainId].fees
        content += `${this.fees[name].fee} ${unit}`
      }

      return `${content}</div>`
    }
  }
}
</script>

<style lang="scss">
.fee-selector.btn-group label.btn {
  text-transform: capitalize;
}
</style>
