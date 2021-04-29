<template>
  <div class="notification-content">
    <SpinnerIcon class="mr-2" />
    <div class="notification-text">
      <strong>Sign to {{ action }} Swap</strong>
    </div>
    <router-link :to="`/details/swap/${item.id}`"
                 class="btn btn-sm btn-outline-primary">
      Sign Now
    </router-link>
  </div>
</template>

<script>
import SpinnerIcon from '@/assets/icons/spinner.svg'

export default {
  props: ['item'],
  components: {
    SpinnerIcon
  },
  computed: {
    action () {
      if (this.item.status === 'INITIATION_CONFIRMED') {
        return 'Fund'
      } else if (this.item.status === 'READY_TO_CLAIM') {
        return 'Claim'
      } else if (this.item.status === 'GET_REFUND') {
        return 'Refund'
      }
      return null
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  svg {
    width: 30px;
    height: 30px;
    vertical-align: middle;
  }

  .notification-text {
    font-size: $font-size-head-title;
    font-weight: bold;
    width: 200px;
  }

  .btn {
    flex: 0 0 90px;
  }
}
</style>
