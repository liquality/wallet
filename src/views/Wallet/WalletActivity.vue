<template>
  <div class="wallet-activity">
    <ActivityFilter
      @filters-changed="applyFilters"
      :activity-data="activityData"
      v-if="activity.length"
      :showTypeFilters="true"
    />
    <TransactionList v-if="activity.length" :transactions="activityData" />
    <EmptyActivity v-else :active-network="activeNetwork" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { applyActivityFilters } from '@liquality/wallet-core/dist/src/utils/history'

export default {
  components: {
    ActivityFilter: () => import('@/components/ActivityFilter'),
    TransactionList: () => import('@/components/TransactionList'),
    EmptyActivity: () => import('@/components/EmptyActivity')
  },
  data() {
    return {
      activityData: []
    }
  },
  computed: {
    ...mapGetters(['activity']),
    ...mapState(['activeNetwork'])
  },
  methods: {
    applyFilters(filters) {
      this.activityData = applyActivityFilters([...this.activity], filters)
    }
  },
  mounted() {
    this.activityData = [...this.activity]
  },
  watch: {
    activeNetwork() {
      this.activityData = [...this.assetHistory]
    },
    activity() {
      this.activityData = [...this.activity]
    }
  }
}
</script>

<style lang="scss"></style>
