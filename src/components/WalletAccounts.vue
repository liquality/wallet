<template>
  <div>
    <div
      v-for="account in filteredItems"
      :key="account.id"
      class="overview-screen-chain-section"
      :id="account.chain.toUpperCase()"
    >
      <ListItem v-if="isBitcoin(account.chain)" @item-selected="selectItem(account)">
        <template #prefix>
          <div class="account-color" :style="{ 'background-color': account.color }"></div>
        </template>
        <template #icon>
          <img :src="getAccountIcon(account.chain)" class="asset-icon" />
        </template>
        {{ account.alias ? `${account.name} - ${account.alias}` : account.name }}
        <template #sub-title>
          {{
            account.addresses && account.addresses[0] ? shortenAddress(account.addresses[0]) : ''
          }}
        </template>
        <template #detail>
          <div class="detail-content">
            <div class="ledger-tag" v-if="account.type && account.type.includes('ledger')">
              Ledger
            </div>
            <div :id="account.assets[0]" v-if="account.balances[account.assets[0]]">
              {{ prettyBalance(account.balances[account.assets[0]], account.assets[0]) }}
              {{ account.assets[0] }}
            </div>
          </div>
        </template>
        <template
          #detail-sub
          v-if="account.totalFiatBalance && account.loadingInitialBalance === false"
        >
          {{ formatFiatUI(formatFiat(account.totalFiatBalance)) }}
        </template>
        <template v-else> Loading... </template>
      </ListItem>
      <div v-else>
        <ListItem @item-selected="toggleExpandedAccounts(account.id)">
          <template #prefix>
            <div class="account-color" :style="{ 'background-color': account.color }"></div>
            <div class="prefix-icon-container">
              <MinusIcon v-if="shouldExpandAccount(account)" class="prefix-icon" />
              <PlusIcon v-else class="prefix-icon" />
            </div>
          </template>
          <template #icon>
            <img :src="getAccountIcon(account.chain)" class="asset-icon" />
          </template>
          {{ account.alias ? `${account.name} - ${account.alias}` : account.name }}
          <template #sub-title>
            {{
              account.addresses && account.addresses[0] ? shortenAddress(account.addresses[0]) : ''
            }}
          </template>
          <template #detail>
            <div class="ledger-tag" v-if="account.type && account.type.includes('ledger')">
              Ledger
            </div>
          </template>
          <template
            #detail-sub
            v-if="account.totalFiatBalance && account.loadingInitialBalance === false"
          >
            {{ formatFiatUI(formatFiat(account.totalFiatBalance)) }}
          </template>
          <template v-else> Loading... </template>
        </ListItem>
        <div class="account-assets" :class="{ active: shouldExpandAccount(account) }">
          <ListItem
            v-if="account.nftAssets && account.nftAssets.length > 0"
            @item-selected="
              $router.push({
                path: `/wallet/nfts/activity/${account.chain}`
              })
            "
          >
            <template #prefix>
              <div class="account-color" :style="{ 'background-color': account.color }"></div>
            </template>
            <template #icon class="account-asset-item">
              <NFTIcon class="asset-icon" />
            </template>
            NFTs ({{ account.nftAssets.length || 0 }})
            <template #detail>
              <router-link
                class="d-flex align-items-center link"
                :to="{
                  path: `/wallet/nfts/activity/${account.chain}`
                }"
                >see all</router-link
              >
            </template>
          </ListItem>
          <ListItem
            v-for="asset in account.assets"
            :id="asset"
            :key="asset"
            @item-selected="selectItem(account, asset)"
          >
            <template #prefix>
              <div class="account-color" :style="{ 'background-color': account.color }"></div>
            </template>
            <template #icon class="account-asset-item">
              <img :src="getAssetIcon(asset)" class="asset-icon" />
            </template>
            {{ getAssetName(asset) }}
            <template #detail>
              {{ prettyBalance(account.balances[asset], asset) }} {{ asset }}
            </template>
            <template #detail-sub v-if="account.fiatBalances[asset]">
              {{ formatFiatUI(formatFiat(account.fiatBalances[asset])) }}
            </template>
          </ListItem>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import ListItem from '@/components/ListItem'
import {
  prettyBalance,
  formatFiat,
  formatFiatUI
} from '@liquality/wallet-core/dist/utils/coinFormatter'
import { getAssetIcon } from '@/utils/asset'
import { getAccountIcon } from '@/utils/accounts'
import cryptoassets from '@liquality/wallet-core/dist/utils/cryptoassets'
import PlusIcon from '@/assets/icons/plus_icon.svg'
import MinusIcon from '@/assets/icons/minus_icon.svg'
import { shortenAddress } from '@liquality/wallet-core/dist/utils/address'
import NFTIcon from '@/assets/icons/nft.svg'
import { ChainId } from '@liquality/cryptoassets'

export default {
  components: {
    ListItem,
    PlusIcon,
    MinusIcon,
    NFTIcon
  },
  props: ['search', 'accounts'],
  data() {
    return {
      expandedAccounts: []
    }
  },
  created() {
    this.getNftCollections()
  },
  computed: {
    ...mapState(['activeWalletId', 'activeNetwork']),
    ...mapGetters(['accountsData']),
    filteredItems() {
      if (!this.search) return this.accounts

      const search = this.search.toUpperCase()
      const assetComparator = (asset) => {
        return (
          asset.toUpperCase().includes(search) ||
          cryptoassets[asset].name.toUpperCase().includes(search)
        )
      }
      return this.accounts
        .filter((account) => account.assets.find(assetComparator))
        .map((account) => ({
          ...account,
          assets: account.assets.filter(assetComparator)
        }))
    }
  },
  methods: {
    ...mapActions(['getNFTAssets']),
    getAccountIcon,
    getAssetIcon,
    prettyBalance,
    formatFiat,
    formatFiatUI,
    shortenAddress,
    getAssetName(asset) {
      return cryptoassets[asset] ? cryptoassets[asset].name : asset
    },
    toggleExpandedAccounts(id) {
      if (this.expandedAccounts.includes(id)) {
        this.expandedAccounts = this.expandedAccounts.filter((account) => account.id === id)
      } else {
        this.expandedAccounts.push(id)
      }
    },
    selectItem(account, asset) {
      this.$emit('item-selected', { account, asset })
    },
    shouldExpandAccount(account) {
      return this.expandedAccounts.includes(account.id) || this.search
    },
    async getNftCollections() {
      try {
        await this.getNFTAssets({
          walletId: this.activeWalletId,
          network: this.activeNetwork
        })
      } catch (error) {
        console.error(error)
      }
    },
    isBitcoin(chain) {
      return chain === ChainId.Bitcoin
    }
  }
}
</script>
<style lang="scss">
.ledger-tag {
  color: #4763cd;
}
.detail-content {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.account-assets {
  margin: 0;
  height: auto;
  width: 100%;
  display: none;

  &.active {
    display: block;
  }

  .account-asset-item {
    padding-left: 30px;
  }

  .list-item-icon {
    margin-left: 33px !important;
  }
}

.prefix-icon-container {
  display: flex;
  align-items: center;
  margin-left: 12px;
  .prefix-icon {
    width: 12px;
  }
}

.account-color {
  width: 5px;
  height: 60px;
  position: absolute;
  left: 0;
  margin-right: 5px;
}

.link {
  color: $color-primary !important;
  font-weight: 600;
}
</style>
