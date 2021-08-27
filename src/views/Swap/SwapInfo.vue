<template>
  <div v-if="showRefundMessage" class="swap-info mb-3">
    <div class="d-flex align-items-center">
      <ClockIcon class="swap-info_clock mr-2" />
      <p id="media-body-info" class="my-0">
        <span v-if="showSlippageMessage">Max slippage is 0.5%.</span>
        <span v-else class="text-muted">If the swap doesn’t complete in 3 hours, you will be refunded in
        6 hours at {{ expiration }}</span>
      </p>
    </div>
  </div>
</template>

<script>
import { add, format } from 'date-fns'
import ClockIcon from '@/assets/icons/clock.svg'
import { getSwapProviderConfig, SwapProviderType } from '@/utils/swaps'
import { mapState } from 'vuex'

export default {
  props: ['quote'],
  components: {
    ClockIcon
  },
  computed: {
    ...mapState(['activeNetwork']),
    expiration: function () {
      return format(add(new Date(), { hours: 6 }), 'h:mm a')
    },
    showSlippageMessage () {
      const providerType = getSwapProviderConfig(this.activeNetwork, this.quote.provider).type
      return (providerType !== SwapProviderType.LIQUALITY) && (providerType !== SwapProviderType.FASTBTC)
    },
    showRefundMessage () {
      const providerType = getSwapProviderConfig(this.activeNetwork, this.quote.provider).type
      return providerType !== SwapProviderType.FASTBTC
    }
  }
}
</script>

<style lang="scss" scoped>
.swap-info {
  text-align: left;

  &_clock {
    width: 14px;
    height: 14px;
    flex: 0 24px;
  }

  p {
    font-size: $font-size-xs;
  }
}
</style>
