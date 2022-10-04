<template>
  <div class="notification-content">
    <div class="notification-text">
      {{ $t('components.cannotCoverMinimumMessage.needMore', { asset }) }}
    </div>
    <router-link :to="accountUrl" class="btn btn-option get-bridgeAsset-btn">
      {{ $t('common.get') }} {{ asset }}
    </router-link>
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
    max-width: 120px;
    padding: 0 0.5rem;
    display: inline-block;
  }
  .notification-text {
    width: 100%;
  }
}
</style>
