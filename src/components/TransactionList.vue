<template>
  <div class="transaction-list">
    <ListItem
      v-for="item in transactions"
      :key="item.id"
      :to="getDetailsUrl(item)"
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
        {{ getDetailSub(item) }}
      </template>
      <template #detail-icon>
        <div class="transaction-status" v-if="!item.error">
          <CompletedIcon v-if="isConfirmed(item)" />
          <div class="transaction-confirming" v-else>
            <SpinnerIcon />
            <span class="transaction-steps" v-if="getTotalSteps(item) > 2">
              {{ getTransactionStep(item) }} / {{ getTotalSteps(item) }}
            </span>
          </div>
        </div>
      </template>
    </ListItem>
  </div>
</template>

<script>
import ListItem from '@/components/ListItem'
import {
  getItemIcon,
  getStep,
  ACTIVITY_FILTER_STATUSES,
  ACTIVITY_FILTER_TYPES,
  SEND_STATUS_FILTER_MAP,
  SWAP_STATUS_FILTER_MAP
} from '@/utils/history'
import { prettyBalance } from '@/utils/coinFormatter'
import moment from '@/utils/moment'
import CompletedIcon from '@/assets/icons/completed.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'

export default {
  components: {
    ListItem,
    CompletedIcon,
    SpinnerIcon
  },
  props: ['transactions'],
  methods: {
    getItemIcon,
    prettyBalance,
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
      const status = {
        SEND: SEND_STATUS_FILTER_MAP[item.status],
        SWAP: SWAP_STATUS_FILTER_MAP[item.status]
      }[item.type]
      if (status) {
        const filterStatus = ACTIVITY_FILTER_STATUSES[status]
        if (filterStatus) {
          return filterStatus.label
        }
      }

      return ''
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
    getDetailIcon (item) {},
    isConfirmed (item) {
      return ['SUCCESS', 'REFUNDED'].includes(item.status)
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
    }
  }
}
</script>

<style lang="scss">
.transaction-status {
  grid-area: status;
  justify-self: center;

  svg {
    width: 30px;
    height: 30px;
  }

  .transaction-confirming {
    position: relative;
  }

  .transaction-steps {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    top: 0;
    font-size: $font-size-tiny;
    letter-spacing: -1px;
  }
}
</style>
