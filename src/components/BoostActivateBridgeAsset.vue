<template>
  <div class="notification-content">
    <div class="notification-text">To trade this pair {{ asset }} has to be enabled</div>
    <button type="button" class="btn btn-option get-bridgeAsset-btn" @click="toggleAsset()">
      OK, do it
    </button>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: ['network', 'walletId', 'asset'],
  methods: {
    ...mapActions(['enableAssets']),
    toggleAsset() {
      const params = {
        network: this.network,
        walletId: this.walletId,
        assets: [this.asset]
      }
      this.enableAssets(params)
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
    width: 70px;
    display: inline-block;
  }
  .notification-text {
    width: 230px;
  }
}
</style>
