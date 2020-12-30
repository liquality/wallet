<template>
 <div class="dropdown asset-list-search">
  <button class="btn dropdown-toggle"
          @click="toogle">
     <div class="form">
        <div class="input-group">
                <img
                :src="getAssetIcon(selectedAsset)"
                class="asset-icon"
              />
              <span class="input-group-text">
                    {{ selectedAsset }}
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
    <li v-for="asset in filteredItems" :key="asset">
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

export default {
  components: {
    SearchIcon,
    ChevronDownIcon,
    ChevronUpIcon
  },
  props: ['assets', 'selected'],
  data () {
    return {
      selectedAsset: this.selected,
      dropdownOpen: false,
      search: '',
      filteredItems: []
    }
  },
  computed: {
    items () {
      return this.assets.filter(a => a !== this.selectedAsset)
    }
  },
  watch: {
    search: function (newSearch, oldSearch) {
      if (newSearch && newSearch !== oldSearch) {
        this.filteredItems = this.items.filter(
          a => a.toUpperCase().includes(newSearch.toUpperCase())
        )
      } else {
        this.filteredItems = [...this.items]
      }
    }
  },
  methods: {
    getAssetColorStyle,
    getAssetIcon,
    selectItem (asset) {
      this.selectedAsset = asset
      this.$emit('asset-changed', asset)
      this.dropdownOpen = false
      this.filteredItems = [...this.items]
    },
    toogle () {
      this.dropdownOpen = !this.dropdownOpen
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
    border-radius: 0;
    padding-top: 10px;
    padding-bottom: 0;
    margin: 0;
    border: 1px solid #D9DFE5;

    .dropdown-header {
      padding-left: 15px;
      padding-right: 15px;

      .input-group {
        align-items: center;

        input {
          margin-right: 8px;
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
      border-bottom: 1px solid $hr-border-color;

      &:hover, &.active {
        background-color: #F0F7F9;
        color: $color-text-primary;
      }

      .dropdown-item-asset-item {
        padding: 0 15px;
        img {
          margin-right: 5px;
        }
      }
    }
}
}
</style>
