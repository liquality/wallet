<template>
 <div class="dropdown asset-list-search">
  <button class="btn btn-icon dropdown-toggle"
          @click="toogle">
     <div class="form">
        <div class="input-group">
              <span class="input-group-text">
                <img
                :src="getAssetIcon(selectedAsset)"
                class="asset-icon"
              />
              </span>
              <span class="input-group-text">
                    {{ selectedAsset }}
              </span>
        </div>
      </div>
  </button>
  <ul class="dropdown-menu" :class="{ show: dropdownOpen }">
    <li>
      <div class="form dropdown-header">
        <div class="input-group">
              <span class="input-group-text">
                <SearchIcon/>
              </span>
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
  </ul>
</div>
</template>

<script>
import {
  getAssetColorStyle,
  getAssetIcon
} from '@/utils/asset'
import SearchIcon from '@/assets/icons/search.svg'

export default {
  components: {
    SearchIcon
  },
  props: ['assets', 'initialSelected'],
  data () {
    return {
      selectedAsset: this.initialSelected,
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
    serach: function (newSearch, oldSearch) {
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
    },
    toogle () {
      console.log('on toogle', this.items)
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
  .dropdown-menu {
    width: 215px;
    border-radius: 0;
    padding: 10px 0;
    margin: 0;

    .dropdown-header {
      padding-left: 15px;
      padding-right: 15px;
      svg {
        width: 16px;
        margin-right: 8px;
      }
    }

    .dropdown-item {
      padding: 0.25rem 0;
      border-bottom: 1px solid $hr-border-color;

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
