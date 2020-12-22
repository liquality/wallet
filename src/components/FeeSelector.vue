<template>
  <div class="fee-selector btn-group btn-group-toggle" data-toggle="buttons">
    <label class="btn btn-option btn-option-lg"
        v-for="name in ['slow', 'average', 'fast']" :key="name"
        :class="{ active: (name === value)}"
        v-tooltip="{
          content: getTooltip(name),
          trigger: txTypes ? 'hover' : 'manual'
        }"
        v-on:click="$emit('input', name)">
        <input type="radio" name="fee" autocomplete="off" :checked="name === value"> {{name}}
    </label>
  </div>
</template>

<script>
import { getTxFee } from '@/utils/fees'
import BN from 'bignumber.js'
import { prettyFiatBalance } from '@/utils/coinFormatter'

export default {
  props: ['asset', 'value', 'fees', 'txTypes', 'fiatRates'],
  methods: {
    getTooltip (name) {
      let content = '<div class="text-right">'
      if (this.fees[name].wait) {
        content += `${this.fees[name].wait} sec<br />`
      }

      if (this.txTypes) {
        const total = this.txTypes.reduce((accum, tx) => {
          return accum.plus(getTxFee(this.asset, tx, this.fees[name].fee))
        }, BN(0))
        const totalFiat = prettyFiatBalance(total, this.fiatRates[this.asset])
        content += `${total} ${this.asset}`
        content += `<br />${totalFiat} USD`
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
