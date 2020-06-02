<template>
  <div class="swap-info">
    <h5 class="swap-info_title">What happens when you swap?</h5>
    <div class="media"><LockIcon class="icon-fill-primary" /><p class="text-muted media-body">When initiating the swap your funds will be securely locked into escrow</p></div>
    <div class="media"><ClockIcon /><p class="text-muted media-body">If the swap doesn’t complete within 6 hours, your funds will be released in 12 hours at {{expiration}}</p></div>
  </div>
</template>

<script>
import LockIcon from '@/assets/icons/lock.svg'
import ClockIcon from '@/assets/icons/clock.svg'
import { add, format } from 'date-fns'

export default {
  components: {
    LockIcon,
    ClockIcon
  },
  computed: {
    expiration: function() {
      return format(add(new Date(), { hours: 12 }), 'h:mm a')
    }
  }
}
</script>

<style lang="scss">
.swap-info {
  text-align: left;

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