<template>
  <div class="notification-content">
    <div class="notification-text">More {{ asset }} required to cover minimum trade plus fees.</div>
    <router-link :to="accountUrl" class="btn btn-option get-bridgeAsset-btn"> Get </router-link>
  </div>
</template>

<script>
export default {
  props: {
    accountId: String,
    asset: String
  },
  computed: {
    accountUrl() {
      return `/accounts/${this.accountId}/${this.asset}/receive`
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .get-bridgeAsset-btn {
    width: 110px;
    display: inline-block;
  }
  .notification-text {
    width: 230px;
  }
}
</style>
