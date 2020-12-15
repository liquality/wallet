<template>
   <div class="wallet-activity">
       <WalletActivityFilter @filtes-changed="applyFilters" @expot-requested="exportActivity"/>
       <ListItem v-for="(item, key) in activityData"
                  :key="key"
                  :to="getDetailsUrl(item)">
            <template #icon>
              <img :src="getTypeIcon(item.type)" />
            </template>
            {{ getTitle(item) }}
            <template #sub-title>
              {{ getSubTitle(item) }}
            </template>
            <template #detail>
              {{ getDetail(item) }}
            </template>
            <template #detail-sub>
              {{ getDetailSub(item) }}
            </template>
            <template #detail-icon>

            </template>
        </ListItem>
   </div>
</template>

<script>
import WalletActivityFilter from './WalletActivityFilter'
import ListItem from '@/components/ListItem'
import { mapGetters } from 'vuex'
import { getItemIcon, getStatusLabel, ACTIVITY_FILTER_TYPES } from '@/utils/history'
import { prettyBalance } from '@/utils/coinFormatter'
import moment from '@/utils/moment'
import { getCSVContent, exportToCSV } from '@/utils/export'

export default {
  components: {
    WalletActivityFilter,
    ListItem
  },
  computed: {
    ...mapGetters(['activity']),
    activityData () {
      return this.activity
    }
  },
  methods: {
    getCSVContent,
    exportToCSV,
    getStatusLabel,
    getItemIcon,
    prettyBalance,
    applyFilters ({ types, statuses, dates }) {
      console.log('filters change', types, statuses, dates)
    },
    exportActivity () {
      const content = this.getCSVContent(this.activityData)
      this.exportToCSV({ filename: 'activity.csv', content })
    },
    getTitle (item) {
      switch (item.type) {
        case 'SWAP':
          return `${item.from} to ${item.to}`
        case 'SEND':
          return `Send ${item.from}`
        case 'RECEIVE':
          return `Receive ${item.from}`
        default:
          return ''
      }
    },
    getSubTitle (item) {
      return moment(item.timestamp).format('L, LT')
    },
    getDetail (item) {
      const amount = item.type === 'SWAP' ? item.fromAmount : item.amount
      return `${this.prettyBalance(amount, item.from)} ${item.from}`
    },
    getDetailSub (item) {
      return this.getStatusLabel(item)
    },
    getDetailsUrl (item) {
      return {
        SEND: `/details/${item.id}/transaction`,
        SWAP: `/details/${item.id}/swap`
      }[item.type]
    },
    getTypeIcon (type) {
      const filter = ACTIVITY_FILTER_TYPES[type]
      return this.getItemIcon(filter.icon)
    },
    getDetailIcon (item) {

    }
  }
}
</script>

<style lang="scss">
.wallet-activity {

}
</style>
