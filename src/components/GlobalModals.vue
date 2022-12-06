<template>
  <Lazy>
    <AnalyticsOptInModal />
    <WhatsNewModal />
    <BuyCryptoModal />
    <BuyCryptoOverviewModal />
  </Lazy>
</template>

<script>
import AnalyticsOptInModal from '@/components/AnalyticsOptInModal.vue'
import WhatsNewModal from '@/components/WhatsNewModal.vue'
import BuyCryptoModal from '@/components/BuyCrypto/BuyCryptoModal.vue'
import BuyCryptoOverviewModal from '@/components/BuyCrypto/BuyCryptoOverviewModal.vue'
import Lazy from '@/components/Lazy.vue'

export default {
  components: {
    Lazy,
    AnalyticsOptInModal,
    WhatsNewModal,
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
