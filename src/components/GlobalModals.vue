<template>
  <div>
    <AnalyticsOptInModal />
    <WatsNewModal />
    <BuyCryptoModal />
    <BuyCryptoOverviewModal />
  </div>
</template>

<script>
import AnalyticsOptInModal from '@/components/AnalyticsOptInModal.vue'
import WatsNewModal from '@/components/WatsNewModal.vue'
import BuyCryptoModal from '@/components/BuyCrypto/BuyCryptoModal.vue'
import BuyCryptoOverviewModal from '@/components/BuyCrypto/BuyCryptoOverviewModal.vue'

export default {
  components: {
    AnalyticsOptInModal,
    WatsNewModal,
    BuyCryptoModal,
    BuyCryptoOverviewModal
  }
}
</script>

<style lang="scss" scoped>
div {
  margin: 0;
  padding: 0;
}
</style>
