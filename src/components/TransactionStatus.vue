<template>
    <div class="transaction-status">
        <div class="transaction-confirming" v-if="error || status === 'NEEDS_ATTENTION'">
            <SpinnerIcon />
            <span class="transaction-steps" v-if="totalSteps > 2">
                {{ step }} / {{ totalSteps }}
            </span>
            <span class="error-indicator"></span>
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
import RefundedIcon from '@/assets/icons/refunded.svg'
import CanceledIcon from '@/assets/icons/canceled.svg'

export default {
  components: {
    CompletedIcon,
    SpinnerIcon,
    RefundedIcon,
    CanceledIcon
  },
  props: ['step', 'totalSteps', 'status', 'error']
}
</script>

<style lang="scss">
.transaction-status {
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 30px;
    height: 30px;
    vertical-align: middle;
  }

  .transaction-confirming {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .error-indicator {
    position: absolute;
    top: 13px;
    left: 27px;
    border: solid 3px #F41973;
    border-radius: 100%;
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
