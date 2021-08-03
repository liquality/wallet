<template>
  <v-popover offset="1" trigger="hover focus" placement="top">
    <div class="btn btn-option swap-provider-label" @click="$emit('click')">
      <span class="d-flex align-items-center">
        <img :src="icon" class="mr-1" /><span id="selectedQuote_provider">{{ label }}</span>
      </span>
    </div>
    <template slot="popover">
      <p class="mb-0 text-left"><strong>{{ info.title }}</strong></p>
      <p class="mb-0 text-left">{{ info.description }}</p>
    </template>
  </v-popover>
</template>

<script>
import { getSwapProviderConfig, getSwapProviderIcon, getSwapProviderInfo } from '@/utils/swaps'

export default {
  props: ['provider', 'network'],
  computed: {
    label () {
      return getSwapProviderConfig(this.network, this.provider).name
    },
    icon () {
      return getSwapProviderIcon(this.network, this.provider)
    },
    info () {
      return getSwapProviderInfo(this.network, this.provider)
    }
  }
}
</script>

<style lang="scss" scoped>
.swap-provider-label {
  display: inline-block;
  text-transform: none;
  img {
    height: 15px;
    width: auto;
    max-width: 14px;
  }
}
</style>
