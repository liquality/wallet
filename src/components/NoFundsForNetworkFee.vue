<template>
  <div class="notification-content">
    <div v-if="!receiveFeeProblem" class="notification-text">
      Not enough {{ asset }} to cover fees. Lower speed to account for gas or get more.
    </div>
    <div v-if="receiveFeeProblem" class="notification-text">
      Lower speed to account for gas to cover both sides of transaction, or get more.
    </div>
    <router-link :to="accountUrl" class="btn btn-option get-bridgeAsset-btn">
      Get {{ asset }}
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    accountId: String,
    asset: String,
    receiveFeeProblem: Boolean
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
    width: 90px;
    display: inline-block;
  }
  .notification-text {
    width: 230px;
  }
}
</style>
