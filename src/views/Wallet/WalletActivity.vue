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
import ActivityFilter from '@/components/ActivityFilter'
import TransactionList from '@/components/TransactionList'
import { mapGetters, mapState } from 'vuex'
import EmptyActivity from '@/components/EmptyActivity'
import { applyActivityFilters } from '@liquality/wallet-core/dist/src/utils/history'

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
