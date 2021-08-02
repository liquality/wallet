<template>
  <v-popover offset="1" trigger="hover focus">
    <div class="btn btn-option swap-provider-label">
      <span id="selectedQuote_provider" class="d-flex align-items-center">
        <img :src="icon" class="mr-1" />{{ label }}
      </span>
    </div>
    <template slot="popover">
      <p class="mb-0"><strong>{{ info.title }}</strong></p>
      <p class="mb-0">{{ info.description }}</p>
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
