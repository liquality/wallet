<template>
  <div class="notification-content">
    <div class="notification-text">
      Required Native Asset ({{ asset }}) for Boost swap is disabled.
    </div>
    <button type="button" class="btn btn-option get-bridgeAsset-btn" @click="toggleAsset()">
      Enable
    </button>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: ['network', 'walletId', 'asset'],
  created() {
    console.log(this.network, this.walletId, this.asset)
  },
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
    width: 90px;
    display: inline-block;
  }
  .notification-text {
    width: 230px;
  }
}
</style>
