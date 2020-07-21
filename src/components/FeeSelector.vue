<template>
  <div class="fee-selector btn-group btn-group-toggle" data-toggle="buttons">
    <label class="btn btn-light btn-outline-primary btn-sm"
        v-for="name in ['slow', 'average', 'fast']" :key="name"
        :class="name == value ? 'active' : ''"
        v-tooltip="{content: getTooltip(name)}"
        v-on:click="$emit('input', name)">
        <input type="radio" name="fee" autocomplete="off" :checked="name === value"> {{name}}
    </label>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import cryptoassets from '@liquality/cryptoassets'

export default {
  props: ['asset', 'value', 'fees'],
  methods: {
    ...mapGetters(['client']),
    getTooltip (name) {
      const unit = cryptoassets[this.asset.toLowerCase()].fees.unit
      let content = `${this.fees[name].fee} ${unit}`
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
  font-weight: normal;
}
</style>
