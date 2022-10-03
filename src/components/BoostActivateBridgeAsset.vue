<template>
  <div class="notification-content">
    <div class="notification-text">
      {{ $t('components.boostActivateBridgeAsset.enabledAssetMessage', { asset }) }}
    </div>
    <button type="button" class="btn btn-option get-bridgeAsset-btn" @click="toggleAsset()">
      {{ $t('components.boostActivateBridgeAsset.okDoit') }}
    </button>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: ['network', 'walletId', 'asset', 'updateQuotes'],
  methods: {
    ...mapActions(['enableAssets']),
    toggleAsset() {
      const params = {
        network: this.network,
        walletId: this.walletId,
        assets: [this.asset]
      }
      this.enableAssets(params)
      this.updateQuotes()
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
