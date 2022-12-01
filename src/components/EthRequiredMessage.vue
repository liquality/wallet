<template>
  <div class="notification-content">
    <div class="notification-text">
      {{ $t(`components.ethRequiredMessage.message_${action}`, { nativeAsset }) }}
    </div>
    <router-link :to="accountUrl" class="btn btn-option get-eth-btn">
      {{ $t('components.ethRequiredMessage.getETH', { nativeAsset }) }}
    </router-link>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getNativeAsset, getFeeAsset } from '@liquality/wallet-core/dist/src/utils/asset'
export default {
  props: {
    accountId: String,
    action: {
      type: String,
      default: 'swap'
    }
  },
  computed: {
    ...mapGetters(['accountItem', 'client', 'suggestedFeePrices']),
    account() {
      return this.accountItem(this.accountId)
    },
    accountUrl() {
      return `/accounts/${this.accountId}/${this.nativeAsset}/receive`
    },
    nativeAsset() {
      return getFeeAsset(this.asset) || getNativeAsset(this.asset)
    },
    asset() {
      if (this.account?.assets && this.account?.assets.length > 0) {
        return this.account?.assets[0]
      }
      return null
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
    max-width: 120px;
    padding: 0 0.5rem;
    display: inline-block;
  }
  .notification-text {
    width: 100%;
  }
}
</style>
