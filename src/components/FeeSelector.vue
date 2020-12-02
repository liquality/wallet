<template>
  <div class="fee-selector btn-group btn-group-toggle" data-toggle="buttons">
    <label class="btn btn-light btn-outline-dark btn-sm"
        v-for="name in ['slow', 'average', 'fast']" :key="name"
        :class="{ active: (name === value)}"
        v-tooltip="{content: getTooltip(name)}"
        v-on:click="$emit('input', name)">
        <input type="radio" name="fee" autocomplete="off" :checked="name === value"> {{name}}
    </label>
  </div>
</template>

<script>
import cryptoassets from '@/utils/cryptoassets'
import { getTxFee } from '@/utils/fees'
import BN from 'bignumber.js'

export default {
  props: ['asset', 'value', 'fees', 'txTypes'],
  methods: {
    getTooltip (name) {
      const unit = cryptoassets[this.asset].fees.unit
      let content = `${this.fees[name].fee} ${unit}`
      if (this.txTypes) {
        const total = this.txTypes.reduce((accum, tx) => {
          return accum.plus(getTxFee(this.asset, tx, this.fees[name].fee))
        }, BN(0))
        content += `<br />${total} ${this.asset}`
      }
      if (this.fees[name].wait) {
        content += `<br />${this.fees[name].wait}s`
      }
      return content
    }
  }
}
</script>

<style lang="scss">
.fee-selector.btn-group label.btn {
  text-transform: capitalize;
}
</style>
