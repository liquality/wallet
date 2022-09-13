<template>
  <div class="manage-assets">
    <NavBar :showMenu="true" :showBack="true" backPath="/wallet" backLabel="Overview">
      <span class="wallet_header">
        <strong>{{ $t('pages.manageAssets.assetView') }}</strong>
      </span>
    </NavBar>
    <div class="manage-assets_search form wrapper">
      <div class="input-group">
        <SearchIcon /><input
          type="text"
          id="search_for_an_assert_input"
          autocomplete="off"
          class="form-control form-control-sm"
          v-model="search"
          :placeholder="$t('pages.manageAssets.searchForAsset')"
        />
      </div>
      <router-link to="/settings/manage-assets/custom-token" id="add_custom_token">
        {{ $t('pages.manageAssets.addCustomToken') }}
      </router-link>
      <div v-if="sortedFilteredAssets.length === 0" class="mt-3 d-flex">
        <div>
          <h4>{{ $t('pages.manageAssets.cantFindThisToken') }}</h4>
          <p class="manage-assets_customText">
            {{ $t('pages.manageAssets.addCustomERC20Tokens') }}.
          </p>
          <a
            target="_blank"
            href="https://liquality.io/blog/how-to-use-the-liquality-wallet-101/#q-how-can-i-add-custom-tokens-to-my-liquality-wallet"
            >{{ $t('pages.manageAssets.learnHow') }}</a
          >
        </div>
      </div>
    </div>
    <div class="manage-assets_list">
      <div
        v-for="asset in sortedFilteredAssets"
        :key="asset"
        class="asset-item d-flex align-items-center"
        id="asset_item"
      >
        <img :src="getAssetIcon(asset)" class="asset-icon asset-item_icon" />
        <div class="asset-item_name flex-fill" :id="asset">
          {{ getAssetName(asset) }} ({{ asset }})
        </div>
        <div
          v-if="
            getCryptoassets[asset]?.type === 'native' &&
            !enabledChains[getCryptoassets[asset].chain]
          "
          class="asset-item_toggle"
          :id="asset + '_toggle_button'"
        >
          <toggle-button
            :css-colors="true"
            :value="isAssetEnabled(asset)"
            @change="(e) => toggleAsset(asset, e.value)"
          />
        </div>
        <div
          v-else-if="getCryptoassets[asset]?.type === 'erc20'"
          class="asset-item_toggle"
          :id="asset + '_toggle_button'"
        >
          <toggle-button
            :css-colors="true"
            :value="isAssetEnabled(asset)"
            @change="(e) => toggleAsset(asset, e.value)"
          />
        </div>
        <button
          v-if="isCustomToken(asset)"
          class="btn btn-outline-clear btn-sm remove-btn"
          :id="asset + '_remove_custom_token'"
          @click="removeToken(asset)"
        >
          {{ $t('common.remove') }}
        </button>
      </div>
    </div>
    <div
      v-if="search"
      class="wrapper"
      :class="
        Object.keys(sortedFilteredAssets).length
          ? 'manage-assets_bottomSectionWithItems'
          : 'manage-assets_bottomSection'
      "
    >
      <button class="btn btn-light btn-outline-primary btn-lg btn-block" @click="clearSearch">
        {{ $t('common.done') }}
      </button>
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash-es/isEmpty'
import { mapState, mapActions, mapGetters } from 'vuex'
import cryptoassets from '@liquality/wallet-core/dist/src/utils/cryptoassets'
import { getNativeAsset } from '@liquality/wallet-core/dist/src/utils/asset'
import { getAssetIcon } from '@/utils/asset'
import NavBar from '@/components/NavBar.vue'
import SearchIcon from '@/assets/icons/search.svg'
import { buildConfig } from '@liquality/wallet-core'

export default {
  components: {
    SearchIcon,
    NavBar
  },
  data() {
    return {
      search: '',
      assets: [],
      nativeAssets: {}
    }
  },
  computed: {
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'enabledAssets',
      'balances',
      'customTokens',
      'accounts'
    ]),
    ...mapGetters(['accountsData']),
    getCryptoassets() {
      return cryptoassets
    },
    networkAssets() {
      return this.enabledAssets[this.activeNetwork][this.activeWalletId]
    },
    enabledChains() {
      // Here we are filtering native assets depending on which chains/accounts are enabled ( accountsData )
      // By this we are receving object like { BTC: true, ETH: true, AVAX: true}
      // Which allows us to achieve O(1) (constant time) when we are checking if should show toggle
      return Object.entries(this.nativeAssets)
        .filter(([chain]) => this.accountsData.find((account) => account.chain === chain))
        .reduce(
          (acc, [chain, assets]) => ({
            ...acc,
            ...assets.reduce(
              (curr, asset) => ({
                ...curr,
                [chain]: {
                  asset
                }
              }),
              {}
            )
          }),
          {}
        )
    },
    sortedFilteredAssets() {
      if (isEmpty(this.search)) return this.assets

      return this.assets.filter(
        (asset) =>
          asset.toUpperCase().includes(this.search.toUpperCase()) ||
          cryptoassets[asset]?.name.toLowerCase().includes(this.search.toLowerCase())
      )
    },
    sortedAssets() {
      const allAssets = Object.keys(cryptoassets).filter((asset) => {
        const { chain, type } = cryptoassets[asset]
        this.nativeAssets[chain] = this.nativeAssets[chain] ?? []
        if (type === 'native' && !this.nativeAssets[chain].includes(asset)) {
          this.nativeAssets[chain].push(asset)
        }

        return buildConfig.chains.includes(cryptoassets[asset].chain)
      })

      return allAssets.sort((a, b) => this.isAssetEnabled(b) - this.isAssetEnabled(a))
    }
  },
  methods: {
    ...mapActions([
      'enableAssets',
      'disableAssets',
      'removeCustomToken',
      'toggleBlockchain',
      'toggleAccount'
    ]),
    getAssetIcon,
    getAssetName(asset) {
      return cryptoassets[asset]?.name || asset
    },
    isAssetEnabled(asset) {
      const { chain } = cryptoassets[asset]

      return this.enabledChains[chain] && this.networkAssets.includes(asset)
    },
    async toggleAsset(asset, enable) {
      const nativeAsset = getNativeAsset(asset)
      const assets = enable ? [asset, nativeAsset] : [asset]

      const params = {
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        assets
      }

      if (enable) {
        const { chain } = cryptoassets[nativeAsset]

        const isChainEnabledForNative = this.accountsData.find((account) => account.chain === chain)

        if (!isChainEnabledForNative) {
          await this.enableChainAndNativeAsset(chain)
        }
      }

      enable ? this.enableAssets(params) : this.disableAssets(params)
    },
    clearSearch() {
      this.search = ''
    },
    async removeToken(asset) {
      const params = {
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        symbol: asset
      }
      await this.disableAssets({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        assets: [asset]
      })
      this.removeCustomToken(params)

      this.assets = this.assets.filter((_asset) => _asset !== asset)
    },
    isCustomToken(asset) {
      const customTokens = this.customTokens?.[this.activeNetwork]?.[this.activeWalletId]
      return customTokens instanceof Array
        ? customTokens.findIndex((token) => token.symbol === asset) !== -1
        : false
    },
    async enableChainAndNativeAsset(chain) {
      await this.toggleBlockchain({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        chainId: chain,
        enable: true
      })

      const accountIds = this.accounts[this.activeWalletId][this.activeNetwork]
        .filter((acc) => acc.chain === chain)
        .map((a) => a.id)

      await this.toggleAccount({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        accounts: accountIds,
        enable: true
      })
    }
  },
  created() {
    this.assets = this.sortedAssets
  },
  watch: {
    activeNetwork() {
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

  .remove-btn {
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
