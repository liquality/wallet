<template>
 <div class="dropdown asset-list-search"
      v-click-away="hide">
  <button class="btn dropdown-toggle"
          @click="toogle">
     <div class="form">
        <div class="input-group">
                <img
                :src="getAssetIcon(selected)"
                class="asset-icon"
              />
              <span class="input-group-text">
                    {{ selected }}
              </span>
        </div>
      </div>
       <ChevronUpIcon v-if="dropdownOpen" />
        <ChevronDownIcon v-else />
  </button>
  <ul class="dropdown-menu" :class="{ show: dropdownOpen }">
    <li>
      <div class="form dropdown-header">
        <div class="input-group">
              <SearchIcon/>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="search"
                placeholder="Search"
                autocomplete="off"
              />
        </div>
      </div>
    </li>
    <li v-for="(asset, key) in filteredItems" :key="key">
      <a class="dropdown-item"
         href="#"
         @click="selectItem(asset)">
           <div class="dropdown-item-asset-item">
             <img
                :src="getAssetIcon(asset)"
                class="asset-icon"
              />
              {{ asset }}
           </div>
      </a>
    </li>
    <li v-if="filteredItems.length <= 0">
      <span class="dropdown-item"
         href="#">
           <div class="dropdown-item-asset-item">
             No items
           </div>
      </span>
    </li>
  </ul>
</div>
</template>

<script>
import {
  getAssetColorStyle,
  getAssetIcon
} from '@/utils/asset'
import SearchIcon from '@/assets/icons/search.svg'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import ChevronUpIcon from '@/assets/icons/chevron_up.svg'
import clickAway from '@/directives/clickAway'

export default {
  directives: {
    clickAway
  },
  components: {
    SearchIcon,
    ChevronDownIcon,
    ChevronUpIcon
  },
  props: ['assets', 'selected'],
  data () {
    return {
      dropdownOpen: false,
      search: '',
      filteredItems: []
    }
  },
  computed: {
    items () {
      return this.assets.filter(a => a !== this.selected)
    }
  },
  watch: {
    search (newSearch, oldSearch) {
      if (newSearch && newSearch !== oldSearch) {
        this.filteredItems = this.items.filter(
          a => a.toUpperCase().includes(newSearch.toUpperCase())
        )
      } else {
        this.filteredItems = [...this.items]
      }
    },
    assets (newAssets, oldAssets) {
      if (newAssets && newAssets !== oldAssets) {
        if (this.search) {
          this.filteredItems = this.items.filter(
            a => a.toUpperCase().includes(this.search.toUpperCase())
          )
        } else {
          this.filteredItems = [...this.items]
        }
      }
    }
  },
  methods: {
    getAssetColorStyle,
    getAssetIcon,
    selectItem (asset) {
      this.$emit('asset-changed', asset)
      this.dropdownOpen = false
      this.filteredItems = this.assets.filter(a => a !== asset)
    },
    toogle () {
      this.dropdownOpen = !this.dropdownOpen
    },
    hide () {
      this.dropdownOpen = false
    }
  },
  created () {
    this.filteredItems = [...this.items]
  }
}
</script>

<style lang="scss">
.asset-list-search {
  .dropdown-toggle {
    padding-left: 0 !important;
    padding-right: 0 !important;
    font-weight: 300;
    display: flex;
    align-items: center;

    &::after {
      display: none;
    }

    .input-group-text {
      margin-left: 5px;
    }

    svg {
        width: 16px;
        margin-left: 4px;
    }
  }

  .dropdown-menu {
    width: 215px;
    max-height: 185px;
    overflow: auto;
    border-radius: 0;
    padding-top: 10px;
    padding-bottom: 0;
    margin: 0;
    border: 1px solid #D9DFE5;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

    .dropdown-header {
      padding-left: 15px;
      padding-right: 15px;

      .input-group {
        align-items: center;

        input {
          padding-left: 20px;
        }
        svg {
          position: absolute;
          left: 0;
          top: 5px;
          width: 16px;
          margin-right: 8px;
        }
      }
    }

    .dropdown-item {
      padding: 0.438rem 0;
      height: 30px;
      border-bottom: 1px solid $hr-border-color;

      &:hover, &.active {
        background-color: #F0F7F9;
        color: $color-text-primary;
      }

      .dropdown-item-asset-item {
        padding: 0 15px;
        img {
          height: 16px;
          width: 16px;
          margin-right: 5px;
        }
      }
    }
}
}
</style>
