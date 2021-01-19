<template>
   <div class="wallet-activity">
       <ActivityFilter @filters-changed="applyFilters"
                       :activity-data="activityData"
                       v-if="activityData.length > 0"/>
       <TransactionList :transactions="activityData" />
       <div class="activity-empty"
            v-if="activityData.length <= 0">
         Once you start using your wallet you will see the activity here
       </div>
   </div>
</template>

<script>
import ActivityFilter from '@/components/ActivityFilter'
import TransactionList from '@/components/TransactionList'
import { mapGetters, mapState } from 'vuex'
import { applyActivityFilters } from '@/utils/history'

export default {
  components: {
    ActivityFilter,
    TransactionList
  },
  data () {
    return {
      activityData: []
    }
  },
  computed: {
    ...mapGetters(['activity']),
    ...mapState([
      'activeNetwork'
    ])
  },
  methods: {
    applyFilters (filters) {
      this.activityData = applyActivityFilters([...this.activity], filters)
    }
  },
  created () {
    this.activityData = [...this.activity]
  },
  watch: {
    activeNetwork (newVal, oldVal) {
      this.activityData = [...this.assetHistory]
    }
  }
}
</script>

<style lang="scss">

</style>
