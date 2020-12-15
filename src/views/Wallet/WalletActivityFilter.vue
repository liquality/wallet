<template>
  <div class="activity-filter">
    <div class="activity-filter-header h-padding">
      <div @click.stop="open = !open" class="filter-action">
        <ChevronDownIcon :class="open ? '' : 'right'" />
        Filters ({{ filterCount }})
      </div>
      <div class="filter-export">
        <ExportIcon />
        <span class="text-muted">Export</span>
      </div>
    </div>
    <div class="activity-filter-content" v-if="open">
      <div class="activity-filter-content-header h-padding">
        <div @click.stop="reset" class="reset-action">
          <CloseIcon :class="open ? '' : 'right'" />
          <span class="text-muted">Reset</span>
        </div>
      </div>
      <div class="activity-filter-type">
        <div class="activity-filter-section-title h-padding">Date Range</div>
        <div class="date-filter-inputs">
          inputs
        </div>
      </div>
      <div class="activity-filter-type">
        <div class="activity-filter-section-title filter-for-type h-padding">
          Type
        </div>
        <ListItem v-for="(filter, key) in typeFilters"
                  :key="key"
                  @item-selected="toogleTypeFilter(key)"
                  :item-class="filter.selected ? 'selected-item' : ''">
            <template #icon>
              <img :src="getItemIcon(filter.icon)"/>
            </template>
            {{ filter.label }}
            <template #detail-icon>
              <img :src="getItemIcon('selected_icon')" v-if="filter.selected"/>
            </template>
        </ListItem>
      </div>
      <div class="activity-filter-type">
        <div class="activity-filter-section-title filter-for-status h-padding">
          Status
        </div>
        <ListItem v-for="(filter, key) in statusFilters"
                  :key="key"
                  @item-selected="toogleStatusFilter(key)"
                  :item-class="filter.selected ? 'selected-item' : ''">
            <template #icon>
              <img :src="getItemIcon(filter.icon)"/>
            </template>
            {{ filter.label }}
            <template #detail-icon>
                <img :src="getItemIcon('selected_icon')" v-if="filter.selected"/>
            </template>
        </ListItem>
      </div>
    </div>
  </div>
</template>

<script>
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import CloseIcon from '@/assets/icons/close.svg'
import ExportIcon from '@/assets/icons/export.svg'
import ListItem from '@/components/ListItem'
import { ACTIVITY_FILTER_TYPES, ACTIVITY_FILTER_STATUSES, getItemIcon } from '@/utils/history'

export default {
  components: {
    ChevronDownIcon,
    CloseIcon,
    ExportIcon,
    ListItem
  },
  data () {
    return {
      open: false,
      dateFilters: {
        start: null,
        end: null
      },
      statusFilters: {
        ...ACTIVITY_FILTER_STATUSES
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
    getItemIcon,
    toogleTypeFilter (key) {
      if (key in this.typeFilters) {
        this.typeFilters[key].selected = !this.typeFilters[key].selected
        this.typeFilters = Object.assign({}, this.typeFilters)
      }
    },
    toogleStatusFilter (key) {
      if (key in this.statusFilters) {
        this.statusFilters[key].selected = !this.statusFilters[key].selected
        this.statusFilters = Object.assign({}, this.statusFilters)
      }
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
    border-top: 1px solid $hr-border-color;
    border-bottom: 1px solid $hr-border-color;

    .filter-action {
      font-size: $font-size-sm;
      font-weight: $headings-font-weight;
      display: flex;
      align-items: center;
      cursor: pointer;

      svg {
        width: 10px;
        margin-right: 5px;
        vertical-align: middle;
      }

      svg.right {
        transform: rotate(-90deg);
      }
    }

    .filter-export {
      font-size: $font-size-tiny;
      cursor: pointer;

      svg {
        width: 13px;
        margin-right: 5px;
        vertical-align: middle;
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

      .reset-action {
        display: flex;
        cursor: pointer;
        svg {
          width: 10px;
          margin-right: 5px;
          vertical-align: middle;
        }
      }
    }

    .activity-filter-section-title {
      display: flex;
      align-items: center;
      text-transform: uppercase;
      font-style: normal;
      font-weight: bold;
      font-size: $font-size-tiny;
      height: 30px;
    }

    .filter-for-type,
    .filter-for-status,
    .date-filter-inputs {
      border-bottom: 1px solid $hr-border-color;
    }

    .activity-filter-type {
      display: flex;
      flex: 1;
      flex-direction: column;

      .selected-item {
        background-color: #F0F7F9;
      }
    }
  }
}
</style>
