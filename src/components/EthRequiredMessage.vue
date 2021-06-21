<template>
  <div class="notification-content">
    <div class="notification-text">
      A balance is required to swap and you need ETH to pay for gas.
    </div>
    <router-link :to="accountUrl"
                 class="btn btn-option get-eth-btn">
      Get ETH
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    accountId: String
  },
  computed: {
    accountUrl () {
      return `/accounts/${this.accountId}/ETH/receive`
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-content {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .get-eth-btn {
    width: 68px;
  }
  .notification-text {
    width: 250px;
  }
}
</style>
