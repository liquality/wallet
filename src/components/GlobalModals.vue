<template>
  <div>
    <AnalyticsOptInModal />
    <WatsNewModal />
    <BuyCryptoModal />
  </div>
</template>

<script>
import AnalyticsOptInModal from '@/components/AnalyticsOptInModal.vue'
import WatsNewModal from '@/components/WatsNewModal.vue'
import BuyCryptoModal from '@/components/BuyCrypto/BuyCryptoModal.vue'

export default {
  components: {
    AnalyticsOptInModal,
    WatsNewModal,
    BuyCryptoModal
  }
}
</script>

<style lang="scss" scoped>
div {
  margin: 0;
  padding: 0;
}
</style>
