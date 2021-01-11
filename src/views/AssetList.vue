<template>
  <div class="asset-list">
    <NavBar showMenu="true" showBack="true" backPath="/wallet" backLabel="Overview">
      <span class="asset-list-nav">
        <strong>Select Asset</strong>
      </span>
    </NavBar>
    <div class="main-content">
      <div class="form asset-list-header">
        <div class="input-group">
              <SearchIcon/>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="search"
                placeholder="Search for a Currency"
                autocomplete="off"
              />
        </div>
      </div>
      <div class="list-items">
        <ListItem v-for="asset in filteredItems"
                 :key="asset"
                 :to="`/account/${asset}/${action}?source=assets`">
          <template #icon>
            <img :src="getAssetIcon(asset)" class="asset-icon" />
          </template>
          {{ getAssetName(asset) }}
          <template #sub-title>
            {{asset}}
      </template>
      </ListItem>
        <span class="dropdown-item"
              v-if="filteredItems.length <= 0">
              <div class="dropdown-item-asset-item">
                No items
              </div>
          </span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getAssetColorStyle,
  getAssetIcon
} from '@/utils/asset'
import SearchIcon from '@/assets/icons/search.svg'
import { mapGetters } from 'vuex'
import ListItem from '@/components/ListItem'
import NavBar from '@/components/NavBar'
import cryptoassets from '@/utils/cryptoassets'

export default {
  components: {
    NavBar,
    ListItem,
    SearchIcon
  },
  props: ['action'],
  data () {
    return {
      search: '',
      filteredItems: []
    }
  },
  computed: {
    ...mapGetters(['orderedBalances', 'networkWalletBalances']),
    items () {
      return this.orderedBalances.map(([asset]) => asset)
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
    getAssetName (asset) {
      return cryptoassets[asset] ? cryptoassets[asset].name : asset
    }
  },
  created () {
    this.filteredItems = [...this.items]
  }
}
</script>

<style lang="scss">
.asset-list {
  display: flex;
  flex-direction: column;
  flex: 1;

  .asset-list-nav {
    font-weight: normal;
    text-transform: uppercase;
  }

  .main-content {
    display: flex;
    flex-direction: column;

    .asset-list-header {
      display: flex;
      align-items: center;
      padding-left: 15px;
      padding-right: 15px;
      height: 70px;

      .input-group {
        align-items: center;
        height: 30px;

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
}
}
</style>
