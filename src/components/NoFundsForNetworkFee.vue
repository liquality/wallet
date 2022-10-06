<template>
  <div class="notification-content">
    <div v-if="!receiveFeeProblem && isSameChain" class="notification-text">
      {{ $t('components.noFundsForNetworkFee.noEnoughAsset', { asset: assetChain }) }}
    </div>
    <div v-if="receiveFeeProblem || !isSameChain" class="notification-text">
      {{ $t('components.noFundsForNetworkFee.lowerSpeed') }}
    </div>
    <br />
    <div v-if="isSameChain || receiveFeeProblem">
      <router-link :to="accountUrl" class="btn btn-option get-bridgeAsset-btn">
        {{ $t('components.noFundsForNetworkFee.getAsset', { asset: assetChain }) }}
      </router-link>
    </div>
    <div v-else-if="!isSameChain">
      <router-link :to="accountUrl" class="btn btn-option get-bridgeAsset-btn">
        {{ $t('components.noFundsForNetworkFee.getAsset', { asset: assetChain }) }}
      </router-link>
      {{ $t('common.and') }}
      <router-link :to="toAccountUrl" class="btn btn-option get-bridgeAsset-btn">
        {{ $t('components.noFundsForNetworkFee.getAsset', { asset: toAssetChain }) }}
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    accountId: String,
    assetChain: String,
    receiveFeeProblem: Boolean,
    toAssetChain: String
  },
  computed: {
    accountUrl() {
      return `/accounts/${this.accountId}/${this.assetChain}/receive`
    },
    toAccountUrl() {
      return `/accounts/${this.accountId}/${this.toAssetChain}/receive`
    },
    isSameChain() {
      return this.assetChain === this.toAssetChain
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-content {
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
