<template>
  <div class="transaction-list">
    <ListItem
      v-for="item in transactions"
      :key="item.id"
      :to="getDetailsUrl(item)"
      :itemClass="{ 'text-danger': item.error }"
    >
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
       <span v-if="getUIStatus(item) === 'COMPLETED'">
         ${{ getCompletedAmount(item) }}
       </span>
       <span v-else> {{ getDetailSub(item) }} </span>
      </template>
      <template #detail-icon>
        <TransactionStatus
            :step="getTransactionStep(item)"
            :total-steps="getTotalSteps(item)"
            :status="getUIStatus(item)"
            :error="item.error"/>
      </template>
    </ListItem>
  </div>
</template>

<script>
import ListItem from '@/components/ListItem'
import TransactionStatus from '@/components/TransactionStatus'
import {
  getItemIcon,
  getStep,
  ACTIVITY_STATUSES,
  ACTIVITY_FILTER_TYPES,
  SEND_STATUS_FILTER_MAP,
  SWAP_STATUS_FILTER_MAP
} from '@/utils/history'
import { prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import moment from '@/utils/moment'
import { mapState } from 'vuex'
import { getChainFromAsset } from '@/utils/asset'

export default {
  components: {
    ListItem,
    TransactionStatus
  },
  props: ['transactions'],
  computed: {
    ...mapState(['fiatRates'])
  },
  methods: {
    getItemIcon,
    prettyBalance,
    prettyFiatBalance,
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
      return moment(item.startTime).format('L, LT')
    },
    getDetail (item) {
      const amount = item.type === 'SWAP' ? item.fromAmount : item.amount
      return `${this.prettyBalance(amount, item.from)} ${item.from}`
    },
    getDetailSub (item) {
      const status = this.getUIStatus(item)

      if (status) {
        const filterStatus = ACTIVITY_STATUSES[status]
        if (filterStatus) {
          return filterStatus.label
        }
      }

      return ''
    },
    getUIStatus (item) {
      return {
        SEND: SEND_STATUS_FILTER_MAP[item.status],
        SWAP: SWAP_STATUS_FILTER_MAP[item.status]
      }[item.type]
    },
    getDetailsUrl (item) {
      return {
        SEND: `/details/transaction/${item.id}`,
        SWAP: `/details/swap/${item.id}`
      }[item.type]
    },
    getTypeIcon (type) {
      const filter = ACTIVITY_FILTER_TYPES[type]
      return this.getItemIcon(filter.icon)
    },
    getTransactionStep (item) {
      return getStep(item) + 1
    },
    getTotalSteps (item) {
      switch (item.type) {
        case 'SEND':
          return 2
        case 'SWAP':
          return item.sendTo ? 5 : 4
        default:
          return 0
      }
    },
    getCompletedAmount (item) {
      const amount = item.type === 'SWAP' ? item.fromAmount : item.amount
      const assetChain = getChainFromAsset(item.from)
      return prettyFiatBalance(prettyBalance(amount, item.from), this.fiatRates[assetChain])
    }
  }
}
</script>

<style lang="scss">
</style>
