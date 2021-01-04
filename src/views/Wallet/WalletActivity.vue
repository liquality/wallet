<template>
   <div class="wallet-activity">
       <WalletActivityFilter @filters-changed="applyFilters" @export-requested="exportActivity"/>
       <TransactionList :transactions="activityData" />
   </div>
</template>

<script>
import WalletActivityFilter from './WalletActivityFilter'
import TransactionList from '@/components/TransactionList'
import { mapGetters } from 'vuex'
import { SWAP_STATUS_FILTER_MAP, SEND_STATUS_FILTER_MAP } from '@/utils/history'
import moment from '@/utils/moment'
import { getCSVContent, exportToCSV } from '@/utils/export'

const CSV_HEADERS = [
  {
    label: 'ID',
    key: 'id'
  },
  {
    label: 'Order ID',
    key: 'orderId'
  },
  {
    label: 'Network',
    key: 'network'
  },
  {
    label: 'Created',
    key: 'createdAt'
  },
  {
    label: 'From Asset',
    key: 'from'
  },
  {
    label: 'To Asset',
    key: 'to'
  },
  {
    label: 'From',
    key: 'fromAddress'
  },
  {
    label: 'To',
    key: 'toAddress'
  },
  {
    label: 'Send To',
    key: 'sendTo'
  },
  {
    label: 'Send Amount',
    key: 'fromAmount'
  },
  {
    label: 'Receive Amount',
    key: 'toAmount'
  },
  {
    label: 'Send Amount USD',
    key: 'fromAmountUsd'
  },
  {
    label: 'Receive Amount USD',
    key: 'toAmountUsd'
  },
  {
    label: 'Status',
    key: 'fromAmountUsd'
  },
  {
    label: 'Wallet ID',
    key: 'walletId'
  }
]
export default {
  components: {
    WalletActivityFilter,
    TransactionList
  },
  data () {
    return {
      activityData: [],
      headers: [...CSV_HEADERS]
    }
  },
  computed: {
    ...mapGetters(['activity'])
  },
  methods: {
    getCSVContent,
    exportToCSV,
    applyFilters ({ types, statuses, dates }) {
      let data = [...this.activity]
      if (types.length > 0) {
        data = data.filter(i => types.includes(i.type))
      }

      if (statuses.length > 0) {
        data = data.filter(i => {
          if (i.type === 'SWAP') {
            return statuses.includes(SWAP_STATUS_FILTER_MAP[i.status])
          }

          if (i.type === 'SEND') {
            return statuses.includes(SEND_STATUS_FILTER_MAP[i.status])
          }

          return true
        })
      }

      if (dates.start) {
        const filter = moment(dates.start)
        data = data.filter(i => {
          const start = moment(i.startTime)
          return filter >= start
        })
      }

      if (dates.end) {
        const filter = moment(dates.end)
        data = data.filter(i => {
          const end = moment(i.startTime)
          return filter <= end
        })
      }

      this.activityData = data
    },
    exportActivity () {
      const content = this.getCSVContent(this.activityData, this.headers)
      this.exportToCSV({ filename: 'activity.csv', content })
    }
  },
  created () {
    this.activityData = [...this.activity]
  }
}
</script>

<style lang="scss">

</style>
