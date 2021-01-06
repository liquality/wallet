<template>
   <div class="wallet-activity">
       <ActivityFilter @filters-changed="applyFilters" :activity-data="activityData"/>
       <TransactionList :transactions="activityData" />
   </div>
</template>

<script>
import ActivityFilter from '@/components/ActivityFilter'
import TransactionList from '@/components/TransactionList'
import { mapGetters } from 'vuex'
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
    ...mapGetters(['activity'])
  },
  methods: {
    applyFilters (filters) {
      this.activityData = applyActivityFilters([...this.activity], filters)
    }
  },
  created () {
    this.activityData = [...this.activity]
  }
}
</script>

<style lang="scss">

</style>
