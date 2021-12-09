<template>
  <div class="manage-assets">
    <NavBar showMenu="true" showBack="true" backPath="/wallet" backLabel="Overview">
      <span class="wallet_header"><strong>Asset View</strong></span>
    </NavBar>
    <div class="manage-assets_search form wrapper">
      <div class="input-group">
        <SearchIcon /><input type="text" id="search_for_an_assert_input" autocomplete="off" class="form-control form-control-sm" v-model="search" placeholder="Search for an Asset" />
      </div>
      <router-link to="/settings/manage-assets/custom-token" id="add_custom_token">Add Custom Token</router-link>
      <div v-if="sortedFilteredAssets.length === 0" class="mt-3 d-flex">
        <div>
          <h4>Can't find this token</h4>
          <p class="manage-assets_customText">Add Custom ERC20 tokens.</p>
          <a target="_blank" href="https://liquality.io/blog/how-to-use-the-liquality-wallet-101/#q-how-can-i-add-custom-tokens-to-my-liquality-wallet">Learn how</a>
        </div>
      </div>
      </div>
      <div class="manage-assets_list">
      <div v-for="asset in sortedFilteredAssets" :key="asset" class="asset-item d-flex align-items-center" id="asset_item">
        <img :src="getAssetIcon(asset)" class="asset-icon asset-item_icon" />
        <div class="asset-item_name flex-fill" :id="asset">{{getAssetName(asset)}} ({{asset}})
          <!-- <span v-if="asset in networkWalletBalances" class="asset-item_balance">{{getAssetBalance(asset)}} {{asset}}</span> -->
        </div>
        <div class="asset-item_toggle" :id="asset + '_toggle_button'">
          <toggle-button :css-colors="true" :value="isAssetEnabled(asset)" @change="e => toggleAsset(asset, e.value)" />
        </div>
          <button v-if='isCustomToken(asset)' class="btn btn-outline-clear btn-sm remove-btn"  :id="asset + '_remove_custom_token'" @click="removeToken(asset)" > Remove</button>
      </div>
    </div>
    <div v-if="search" class="wrapper" :class="Object.keys(sortedFilteredAssets).length? 'manage-assets_bottomSectionWithItems': 'manage-assets_bottomSection'">
      <button class="btn btn-light btn-outline-primary btn-lg btn-block" @click="clearSearch">Done</button>
    </div>
  </div>
</template>

<script>
import { isEmpty } from 'lodash-es'
import { mapState, mapActions } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
// import { prettyBalance } from '@/utils/coinFormatter'
import { getAssetIcon } from '@/utils/asset'
import NavBar from '@/components/NavBar.vue'
import SearchIcon from '@/assets/icons/search.svg'
import buildConfig from '@/build.config'

export default {
  components: {
    SearchIcon,
    NavBar
  },
  data () {
    return {
      search: '',
      assets: []
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'enabledAssets', 'balances', 'customTokens']),
    networkAssets () {
      return this.enabledAssets[this.activeNetwork][this.activeWalletId]
    },
    sortedAssets () {
      const allAssets = Object.keys(cryptoassets).filter(asset => buildConfig.chains.includes(cryptoassets[asset].chain))
      const assets = allAssets.sort((a, b) => this.isAssetEnabled(b) - this.isAssetEnabled(a))
      return assets
    },
    sortedFilteredAssets () {
      if (isEmpty(this.search)) return this.sortedAssets

      return this.sortedAssets.filter(
        asset => asset.toUpperCase().includes(
          this.search.toUpperCase()
        ) ||
      cryptoassets[asset]?.name.toLowerCase()
        .includes(this.search.toLowerCase())
      )
    }
  },
  methods: {
    ...mapActions(['enableAssets', 'disableAssets', 'removeCustomToken']),
    getAssetIcon,
    getAssetName (asset) {
      return cryptoassets[asset]?.name || asset
    },
    isAssetEnabled (asset) {
      return this.networkAssets.includes(asset)
    },
    toggleAsset (asset, newValue) {
      const params = { network: this.activeNetwork, walletId: this.activeWalletId, assets: [asset] }
      newValue ? this.enableAssets(params) : this.disableAssets(params)
    },
    clearSearch () {
      this.search = ''
    },
    async removeToken (asset) {
      const params = { network: this.activeNetwork, walletId: this.activeWalletId, symbol: asset }
      await this.disableAssets({ network: this.activeNetwork, walletId: this.activeWalletId, assets: [asset] })
      this.removeCustomToken(params)
    },
    isCustomToken (asset) {
      const customTokens = this.customTokens?.[this.activeNetwork]?.[this.activeWalletId]
      return customTokens instanceof Array ? customTokens.findIndex(token => token.symbol === asset) !== -1 : false
    }
  },
  watch: {
    activeNetwork () {
      this.clearSearch()
    }
  }
}
</script>

<style lang="scss">
.manage-assets {
  display: flex;
  flex-direction: column;
  min-height: 0;

  .remove-btn{
    margin-left: 5px;
  }
  &_customText {
    font-size: $font-size-lg;
  }

  &_bottomSection {
    width: 100%;
    position: absolute;
    bottom: 0;
  }

  &_bottomSectionWithItems {
    width: 100%;
  }

  &_search {
    border-bottom: 1px solid $hr-border-color;
    input {
      margin-right: 8px;
      padding-left: 20px;
    }

    a {
      padding-top: 20px;
    }

    .input-group {
      align-items: center;
      svg {
        position: absolute;
        left: 0;
        top: 5px;
      }
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
