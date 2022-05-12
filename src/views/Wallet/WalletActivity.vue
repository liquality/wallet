<template>
  <div class="wallet-activity">
    <ActivityFilter
      @filters-changed="applyFilters"
      :activity-data="activityData"
      v-if="activityData.length > 0"
    />
    <TransactionList :transactions="activityData" />
    <EmptyActivity v-show="activityData.length <= 0" :active-network="activeNetwork" />
  </div>
</template>

<script>
import ActivityFilter from '@/components/ActivityFilter'
import TransactionList from '@/components/TransactionList'
import { mapGetters, mapState } from 'vuex'
import { applyActivityFilters } from '@liquality/wallet-core/dist/utils/history'
import EmptyActivity from '@/components/EmptyActivity'

export default {
  components: {
    ActivityFilter,
    TransactionList,
    EmptyActivity
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
  created() {
    this.activityData = [...this.activity]
  },
  watch: {
    activeNetwork() {
      this.activityData = [...this.assetHistory]
    }
  }
}
</script>

<style lang="scss"></style>
