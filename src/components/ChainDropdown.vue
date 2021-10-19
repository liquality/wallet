<template>
 <div class="dropdown chain-list-search"
      v-click-away="hide">
  <button class="btn dropdown-toggle"
          @click="toggle">
     <div class="form" id="dropdown-item" v-if="selected">
        <div class="input-group">
                <img
                :src="getChainIcon(selected)"
                class="asset-icon"
              />
              <span class="input-group-text">
                {{ getChainName(selected) }}
              </span>
        </div>
      </div>
       <ChevronUpIcon v-if="dropdownOpen" />
        <ChevronDownIcon v-else />
  </button>
  <ul class="dropdown-menu" :class="{ show: dropdownOpen }">
    <li v-if="showSearch">
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
    <li v-for="chain in filteredItems" :key="chain">
      <a class="dropdown-item"
         :id="`${chain}_web_network`"
         href="#"
         @click="selectItem(chain)">
           <div class="dropdown-item-chain-item">
             <img
                :src="getChainIcon(chain)"
                class="asset-icon"
              />
              {{ getChainName(chain) }}
           </div>
      </a>
    </li>
    <li v-if="filteredItems.length <= 0">
      <span class="dropdown-item"
         href="#">
           <div class="dropdown-item-chain-item">
             No items
           </div>
      </span>
    </li>
  </ul>
</div>
</template>

<script>
import { getAssetColorStyle } from '@/utils/asset'
import { getChainIcon } from '@/utils/accounts'
import { chains } from '@liquality/cryptoassets'
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
  props: ['chains', 'selected', 'showSearch'],
  data () {
    return {
      dropdownOpen: false,
      search: '',
      filteredItems: []
    }
  },
  computed: {
    items () {
      return this.chains.filter(a => a !== this.selected)
    }
  },
  watch: {
    search (newSearch, oldSearch) {
      if (newSearch && newSearch !== oldSearch) {
        this.filteredItems = this.items.filter(
          a => chains[a].name.toUpperCase().includes(newSearch.toUpperCase())
        )
      } else {
        this.filteredItems = [...this.items]
      }
    },
    chains (newChains, oldChains) {
      if (newChains && newChains !== oldChains) {
        if (this.search) {
          this.filteredItems = this.items.filter(
            a => chains[a].name.toUpperCase().includes(this.search.toUpperCase())
          )
        } else {
          this.filteredItems = [...this.items]
        }
      }
    }
  },
  methods: {
    getAssetColorStyle,
    getChainIcon,
    getChainName (chain) {
      const { name, code } = chains[chain]
      return `${name} (${code})`
    },
    selectItem (chain) {
      this.$emit('chain-changed', chain)
      this.dropdownOpen = false
      this.filteredItems = this.chains.filter(a => a !== chain)
    },
    toggle () {
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
.chain-list-search {
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
      font-size: $font-size-lg;
      margin-left: 5px;
    }

    svg {
        width: 16px;
        margin-left: 4px;
    }
  }

  .dropdown-menu {
    max-width: 215px;
    min-width: 8rem;
    max-height: 185px;
    overflow: auto;
    border-radius: 0;
    padding-bottom: 0;
    padding-top: 0;
    margin: 0;
    right: 0;
    left: auto;
    border: 1px solid #D9DFE5;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

    .dropdown-header {
      margin-top: 10px;
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

      .dropdown-item-chain-item {
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
