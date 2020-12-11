<template>
  <div class="manage-assets">
    <NavBar showMenu="true" showBack="true" backPath="/wallet" backLabel="Overview">
      <span class="wallet_header"><strong>Asset View</strong></span>
    </NavBar>
    <div class="manage-assets_search form wrapper">
      <div class="input-group">
        <SearchIcon /><input type="text" autocomplete="off" class="form-control form-control-sm" v-model="search" placeholder="Search for an Asset" />
        <router-link to="/settings/manage-assets/custom-token">Add Token</router-link>
      </div>
    </div>
    <div class="manage-assets_list">
      <div v-for="asset in filteredAssets" :key="asset" class="asset-item d-flex align-items-center">
        <img :src="getAssetIcon(asset)" class="asset-icon asset-item_icon" />
        <div class="asset-item_name flex-fill">{{getAssetName(asset)}} ({{asset}})
          <span v-if="asset in networkWalletBalances" class="asset-item_balance">{{getAssetBalance(asset)}} {{asset}}</span>
        </div>
        <div class="asset-item_toggle">
          <toggle-button :css-colors="true" :value="isAssetEnabled(asset)" @change="e => toggleAsset(asset, e.value)" />
        </div>
      </div>
    </div>
    <div v-if="search" class="wrapper">
      <button class="btn btn-light btn-outline-primary btn-lg btn-block" @click="clearSearch">Done</button>
    </div>
  </div>
</template>

<script>
import { isEmpty } from 'lodash-es'
import { mapState, mapActions } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
import { prettyBalance } from '@/utils/coinFormatter'
import { getAssetIcon } from '@/utils/asset'
import NavBar from '@/components/NavBar.vue'
import SearchIcon from '@/assets/icons/search.svg'

export default {
  components: {
    SearchIcon,
    NavBar
  },
  data () {
    return {
      search: ''
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'enabledAssets', 'balances']),
    filteredAssets () {
      if (isEmpty(this.search)) return this.assets

      return this.assets.filter(asset => asset.toLowerCase().includes(this.search.toLowerCase()) || cryptoassets[asset].name.toLowerCase().includes(this.search.toLowerCase()))
    },
    networkAssets () {
      return this.enabledAssets[this.activeNetwork][this.activeWalletId]
    },
    networkWalletBalances () {
      if (!this.balances[this.activeNetwork]) return false
      if (!this.balances[this.activeNetwork][this.activeWalletId]) return false

      return this.balances[this.activeNetwork][this.activeWalletId]
    }
  },
  methods: {
    ...mapActions(['enableAssets', 'disableAssets']),
    getAssetIcon,
    getAssetName (asset) {
      return cryptoassets[asset].name
    },
    getAssetBalance (asset) {
      return prettyBalance(this.networkWalletBalances[asset], asset)
    },
    isAssetEnabled (asset) {
      return this.networkAssets.includes(asset)
    },
    toggleAsset (asset, newValue) {
      const params = { network: this.activeNetwork, walletId: this.activeWalletId, assets: [asset] }
      newValue ? this.enableAssets(params) : this.disableAssets(params)
    },
    sortAssets () {
      const allAssets = Object.keys(cryptoassets)
      this.assets = allAssets.sort((a, b) => this.isAssetEnabled(b) - this.isAssetEnabled(a))
    },
    clearSearch () {
      this.sortAssets()
      this.search = ''
    }
  },
  created () {
    this.sortAssets()
  }
}
</script>

<style lang="scss">
.manage-assets {
  display: flex;
  flex-direction: column;
  min-height: 0;

  &_search {
    border-bottom: 1px solid $hr-border-color;
    input {
      margin-right: 8px;
    }

    .input-group {
      align-items: center;
    }

    svg {
      width: 16px;
      margin-right: 8px;
    }
  }

  &_list {
    overflow-y: auto;
  }
}

.asset-item {
  width: 100%;
  border-bottom: 1px solid $hr-border-color;
  height: 60px;
  padding: 16px 20px;

  &_icon {
    margin-right: 8px;
  }

  &_toggle {
    text-align: right;
  }

  &_balance {
    display: block;
    font-size: $font-size-tiny;
    color: $text-muted;
  }
}
</style>
