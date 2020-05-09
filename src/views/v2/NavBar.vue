<template>
  <div class="navbar d-flex justify-content-between">
    <div class="navbar_prev"><ChevronLeftIcon class="navbar_prev_icon" />Back</div>
    <div class="navbar_title">MY WALLET</div>
    <div class="navbar_lock">Lock<LockIcon class="navbar_lock_icon" /></div>
  </div>
</template>

<script>

import LockIcon from '@/assets/icons/lock.svg'
import ChevronLeftIcon from '@/assets/icons/chevron_left.svg'

export default {
  components: {
    LockIcon,
    ChevronLeftIcon
  }
}
</script>

<style lang="scss">
.navbar {
  height: 52px;
  padding: 17px;
  border-bottom: 1px solid $hr-border-color;

  &_title {
    font-weight: $headings-font-weight;
  }

  &_lock, &_prev {
    color: $color-text-muted;
    font-size: $font-size-sm;
  }

  &_lock {
    &_icon {
      margin-left: 7px;
    }
  }

  &_prev {
    &_icon {
      margin-right: 7px;
      margin-top: 3px;
    }
  }
}
</style>
