<template>
  <div class="swap-info mb-3">
    <div class="d-flex align-items-center">
      <ClockIcon class="swap-info_clock mr-2" />
      <p id="media-body-info" class="my-0">
        <span v-if="showRefundMessage"
          >Max slippage is 3%. If the swap does not complete, you will be refunded in a few
          hours.</span
        >
        <span v-else class="text-muted">Max slippage is 3%.</span>
      </p>
    </div>
  </div>
</template>

<script>
import { add, format } from 'date-fns'
import ClockIcon from '@/assets/icons/clock.svg'
import { getSwapProviderConfig } from '@liquality/wallet-core/dist/swaps/utils'
import { mapState } from 'vuex'
import { SwapProviderType } from '@liquality/wallet-core/dist/store/types'

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
    showSlippageMessage() {
      const providerType = getSwapProviderConfig(this.activeNetwork, this.quote.provider).type
      return (
        providerType !== SwapProviderType.Liquality && providerType !== SwapProviderType.FastBTC
      )
    },
    showRefundMessage() {
      const providerType = getSwapProviderConfig(this.activeNetwork, this.quote.provider).type
      return (
        providerType === SwapProviderType.Liquality ||
        providerType === SwapProviderType.LiqualityBoostERC20ToNative ||
        providerType === SwapProviderType.LiqualityBoostNativeToERC20
      )
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
