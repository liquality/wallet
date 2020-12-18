<template>
    <div class="transaction-status">
        <div class="transaction-confirming" v-if="error || status === 'NEEDS_ATTENTION'">
            <NeedsAttentionIcon />
            <span class="transaction-steps" v-if="totalSteps > 2">
                {{ step }} / {{ totalSteps }}
            </span>
        </div>
        <CompletedIcon v-else-if="status === 'COMPLETED'" />
        <RefundedIcon v-else-if="status === 'REFUNDED'" />
        <CanceledIcon v-else-if="status === 'CANCELED'" />
        <div class="transaction-confirming" v-else-if="status === 'PENDING'">
            <SpinnerIcon />
            <span class="transaction-steps" v-if="totalSteps > 2">
                {{ step }} / {{ totalSteps }}
            </span>
        </div>
    </div>
</template>
<script>

import CompletedIcon from '@/assets/icons/completed.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import NeedsAttentionIcon from '@/assets/icons/needs_attention.svg'
import RefundedIcon from '@/assets/icons/refunded.svg'
import CanceledIcon from '@/assets/icons/canceled.svg'

export default {
  components: {
    CompletedIcon,
    SpinnerIcon,
    NeedsAttentionIcon,
    RefundedIcon,
    CanceledIcon
  },
  props: ['step', 'totalSteps', 'status', 'error']
}
</script>

<style lang="scss">
.transaction-status {
  grid-area: status;
  justify-self: center;

  svg {
    width: 30px;
    height: 30px;
  }

  .transaction-confirming {
    position: relative;
  }

  .transaction-steps {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    top: 0;
    font-size: $font-size-tiny;
    letter-spacing: -1px;
  }
}
</style>
