<template>
  <div class="activity-filter">
    <div class="activity-filter-header h-padding">
      <div class="activity-filter-header-actions">
        <div @click.stop="open = !open" class="filter-action">
        <ChevronDownIcon :class="open ? '' : 'right'" />
        Filters {{ filterCount > 0 ? `(${filterCount})` : '' }}
      </div>
      <div @click.stop="resetFilters"
           class="reset-action"
           v-if="filterCount > 0">
          <CloseIcon :class="open ? '' : 'right'" />
          <span class="text-muted">Reset</span>
        </div>
      </div>
      <div class="filter-export" @click.stop="exportActivity">
        <ExportIcon />
        <span class="text-muted">Export</span>
      </div>
    </div>
    <div class="activity-filter-content" v-show="open">
      <div class="activity-filter-type">
        <div class="activity-filter-section-title-dates h-padding">Date Range</div>
        <div class="date-filter-inputs h-padding form">
          <date-pick v-model="dateFilters.start">
              <template v-slot:default="{toggle, inputValue, inputEvents}">
                  <div class="input-group" @click="toggle">
                    <input type="text" class="form-control form-control-sm" placeholder="Start" :value="inputValue" v-on="inputEvents">
                    <CalendarIcon />
                  </div>
              </template>
          </date-pick>
          <date-pick v-model="dateFilters.end">
              <template v-slot:default="{toggle, inputValue, inputEvents}">
                  <div class="input-group" @click="toggle">
                    <input type="text" class="form-control form-control-sm" placeholder="End" :value="inputValue" v-on="inputEvents">
                    <CalendarIcon />
                  </div>
              </template>
          </date-pick>
        </div>
      </div>
      <div class="activity-filter-type">
        <div class="activity-filter-section-title h-padding">
          Type
        </div>
        <ListItem v-for="(filter, key) in typeFilters"
                  :key="key"
                  @item-selected="toggleTypeFilter(key)"
                  :container-class="filter.selected ? 'selected-item' : ''"
                  :item-class="'h-padding'"
                  h-padding
                  :item-styles="{ height: '40px', paddingTop: '10px', paddingBottom: '10px'}">
            <template #icon>
              <img :src="getItemIcon(filter.icon)"/>
            </template>
            {{ filter.label }}
            <template #detail-icon>
              <img :src="getItemIcon('selected')" v-if="filter.selected"/>
            </template>
        </ListItem>
      </div>
      <div class="activity-filter-type">
        <div class="activity-filter-section-title h-padding">
          Status
        </div>
        <ListItem v-for="(filter, key) in statusFilters"
                  :key="key"
                  @item-selected="toggleStatusFilter(key)"
                  :item-class="filter.selected ? 'selected-item' : ''"
                  :item-styles="{ height: '40px', paddingTop: '10px', paddingBottom: '10px'}">
            <template #icon>
              <img :src="getItemIcon(filter.icon)"/>
            </template>
            {{ filter.label }}
            <template #detail-icon>
                <img :src="getItemIcon('selected')" v-if="filter.selected"/>
            </template>
        </ListItem>
      </div>
    </div>
  </div>
</template>

<script>
import CalendarIcon from '@/assets/icons/calendar.svg'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import CloseIcon from '@/assets/icons/close.svg'
import ExportIcon from '@/assets/icons/export.svg'
import ListItem from '@/components/ListItem'
import { ACTIVITY_FILTER_TYPES, ACTIVITY_STATUSES, getItemIcon } from '@/utils/history'
import DatePick from 'vue-date-pick'
import '@/assets/scss/vue-date-pick.scss'
import { getCSVContent, downloadFile } from '@/utils/export'

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
  props: ['activityData'],
  components: {
    CalendarIcon,
    ChevronDownIcon,
    CloseIcon,
    ExportIcon,
    ListItem,
    DatePick
  },
  data () {
    return {
      headers: [...CSV_HEADERS],
      open: false,
      dateFilters: {
        start: null,
        end: null
      },
      statusFilters: {
        ...ACTIVITY_STATUSES
      },
      typeFilters: {
        ...ACTIVITY_FILTER_TYPES
      }
    }
  },
  computed: {
    filterCount () {
      const count = this.typeFiltersCount + this.statusFiltersCount
      if (this.dateFilters.start !== null || this.dateFilters.end !== null) {
        return count + 1
      }
      return count
    },
    typeFiltersCount () {
      return Object.values(this.typeFilters)
        .filter(f => f.selected === true)
        .length
    },
    statusFiltersCount () {
      return Object.values(this.statusFilters)
        .filter(f => f.selected === true)
        .length
    }
  },
  methods: {
    getCSVContent,
    getItemIcon,
    toggleTypeFilter (key) {
      if (key in this.typeFilters) {
        this.typeFilters[key].selected = !this.typeFilters[key].selected
        this.typeFilters = { ...this.typeFilters }
        this.applyFilters()
      }
    },
    toggleStatusFilter (key) {
      if (key in this.statusFilters) {
        this.statusFilters[key].selected = !this.statusFilters[key].selected
        this.statusFilters = { ...this.statusFilters }
        this.applyFilters()
      }
    },
    exportActivity () {
      const content = this.getCSVContent(this.activityData, this.headers)
      downloadFile({ filename: 'activity.csv', type: 'text/csv;charset=utf-8;', content })
    },
    resetFilters () {
      this.dateFilters = { start: null, end: null }
      for (const key in this.typeFilters) {
        this.typeFilters[key].selected = false
      }

      for (const key in this.statusFilters) {
        this.statusFilters[key].selected = false
      }
      this.typeFilters = { ...this.typeFilters }
      this.statusFilters = { ...this.statusFilters }
      this.applyFilters()
    },
    applyFilters () {
      const types = []
      const statuses = []
      for (const key in this.typeFilters) {
        if (this.typeFilters[key].selected === true) {
          types.push(key)
        }
      }

      for (const key in this.statusFilters) {
        if (this.statusFilters[key].selected === true) {
          statuses.push(key)
        }
      }

      this.$emit('filters-changed', {
        types,
        statuses,
        dates: this.dateFilters
      })
    }
  }
}
</script>

<style lang="scss">
.activity-filter {
  background: #f8faff;
  z-index: 666;

  .activity-filter-header {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid $hr-border-color;

    .activity-filter-header-actions {
      display: flex;
      align-items: center;
    }
    .filter-action {
      font-size: $font-size-sm;
      font-weight: $headings-font-weight;
      display: flex;
      align-items: center;
      cursor: pointer;
      margin-right: 10px;

      svg {
        width: 10px;
        margin-right: 5px;
        vertical-align: middle;
      }

      svg.right {
        transform: rotate(-90deg);
      }
    }

    .reset-action {
        display: flex;
        cursor: pointer;
        svg {
          width: 10px;
          margin-right: 5px;
          vertical-align: middle;
        }
      }

    .filter-export {
      font-size: $font-size-tiny;
      cursor: pointer;

      svg {
        width: 13px;
        margin-right: 5px;
        vertical-align: middle;
        margin-bottom: 3px;
      }
    }
  }

  .activity-filter-content {
    border-bottom: 1px solid $hr-border-color;
    box-sizing: border-box;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    margin-bottom: 4px;
    display: flex;
    flex-direction: column;
    flex: 1;

    .activity-filter-content-header {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-top: 13px;
    }

    .activity-filter-section-title {
      display: flex;
      align-items: center;
      text-transform: uppercase;
      font-style: normal;
      font-weight: 700;
      font-size: $font-size-tiny;
      height: 30px;
      border-bottom: 1px solid $hr-border-color;
    }

    .activity-filter-section-title-dates {
      display: flex;
      align-items: center;
      text-transform: uppercase;
      font-style: normal;
      font-weight: bold;
      font-size: $font-size-tiny;
      padding-top: 25px;
    }

    .date-filter-inputs {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 25px;
      border-bottom: 1px solid $hr-border-color;

      .input-group {
        width: 150px;
      }

      svg {
        width: 14px;
        vertical-align: middle;
        cursor: pointer;
        position: absolute;
        right: 0;
        top: 5px;
      }
    }

    .activity-filter-type {
      display: flex;
      flex: 1;
      flex-direction: column;

      .selected-item {
        background-color: #ffffff;
      }
    }
  }
}
</style>
