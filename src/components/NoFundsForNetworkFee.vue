<template>
  <div class="notification-content">
    <div v-if="!receiveFeeProblem && isSameChain" class="notification-text">
      Not enough {{ assetChain }} to cover fees. Lower speed to account for gas or get more.
    </div>
    <div v-if="receiveFeeProblem || !isSameChain" class="notification-text">
      Lower speed to account for gas to cover both sides of transaction, or get more.
    </div>
    <br />
    <div v-if="isSameChain || receiveFeeProblem">
      <router-link :to="accountUrl" class="btn btn-option get-bridgeAsset-btn">
        Get {{ assetChain }}
      </router-link>
    </div>
    <div v-else-if="!isSameChain">
      <router-link :to="accountUrl" class="btn btn-option get-bridgeAsset-btn">
        Get {{ assetChain }}
      </router-link>
      and
      <router-link :to="toAccountUrl" class="btn btn-option get-bridgeAsset-btn">
        Get {{ toAssetChain }}
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
      console.log(this.assetChain)
      console.log(this.toAssetChain)
      return this.assetChain === this.toAssetChain
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-content {
  // display: flex;
  justify-content: space-between;
  align-items: center;
  .get-bridgeAsset-btn {
    width: 110px;
    display: inline-block;
  }
  .notification-text {
    // width: 230px;
  }
}
</style>
