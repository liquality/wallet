<template>
  <div class="swap-info">
    <h5 class="swap-info_title">What happens when you swap?</h5>
    <div class="media"><LockIcon class="icon-fill-primary" /><p class="text-muted media-body">When initiating the swap your funds will be securely locked into escrow</p></div>
    <div class="media"><ClockIcon /><p class="text-muted media-body">If the swap doesn’t complete within 6 hours, your funds will be released in 12 hours at 4:39am</p></div>
  </div>
</template>

<script>
import LockIcon from '@/assets/icons/lock.svg'
import ClockIcon from '@/assets/icons/clock.svg'

export default {
  components: {
    LockIcon,
    ClockIcon
  }
}
</script>

<style lang="scss">
.swap-info {
  &_title {
    font-size: $font-size-sm;
  }
  svg {
    margin-top: 6px;
    margin-right: 8px;
    height: 20px;
    width: 20px;
    object-fit: contain;
  }
  p {
    font-size: $font-size-sm;
  }
}
</style>