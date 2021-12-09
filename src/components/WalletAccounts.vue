<template>
  <div>
    <div v-for="account in filteredItems" :key="account.id" class="overview-screen-chain-section" :id="account.chain.toUpperCase()">
      <ListItem v-if="account.chain === 'bitcoin'"
                @item-selected="selectItem(account)">
          <template #prefix>
            <div class="account-color"
                 :style="{'background-color': account.color}">
            </div>
          </template>
          <template #icon>
            <img :src="getAccountIcon(account.chain)"
                 class="asset-icon" />
          </template>
          {{ account.alias ? `${account.name} - ${account.alias}` : account.name }}
          <template #sub-title>
            {{ account.addresses && account.addresses[0] ? shortenAddress(account.addresses[0]) : '' }}
          </template>
          <template #detail>
            <div class="detail-content">
              <div class="ledger-tag"
                   v-if="account.type && account.type.includes('ledger')">
              Ledger
            </div>
            <div :id="account.assets[0]" v-if="account.balances[account.assets[0]]">
              {{ prettyBalance(account.balances[account.assets[0]], account.assets[0]) }} {{account.assets[0]}}
            </div>
            </div>
          </template>
          <template #detail-sub v-if="account.totalFiatBalance && account.loadingInitialBalance === false">
            ${{ formatFiat(account.totalFiatBalance) }}
          </template>
          <template v-else>
            Loading...
          </template>
      </ListItem>
      <div v-else>
        <ListItem
          @item-selected="toggleExpandedAccounts(account.id)"
        >
          <template #prefix>
             <div class="account-color"
                 :style="{'background-color': account.color}">
            </div>
            <div class="prefix-icon-container">
              <MinusIcon v-if="shouldExpandAccount(account)"
              class="prefix-icon"/>
              <PlusIcon v-else class="prefix-icon"/>
            </div>
          </template>
          <template #icon>
            <img :src="getAccountIcon(account.chain)"
                 class="asset-icon" />
          </template>
          {{ account.alias ? `${account.name} - ${account.alias}` : account.name }}
          <template #sub-title>
            {{ account.addresses && account.addresses[0] ? shortenAddress(account.addresses[0]) : '' }}
          </template>
          <template #detail>
            <div class="ledger-tag"
                   v-if="account.type && account.type.includes('ledger')">
              Ledger
            </div>
          </template>
          <template #detail-sub v-if="account.totalFiatBalance && account.loadingInitialBalance === false">
            ${{ formatFiat(account.totalFiatBalance) }}
          </template>
          <template v-else>
            Loading...
          </template>
      </ListItem>
      <div class="account-assets"
           :class="{ active: shouldExpandAccount(account) }">
        <ListItem v-for="asset in account.assets"
                  :id="asset"
                 :key="asset"
                 @item-selected="selectItem(account, asset)">
          <template #prefix>
             <div class="account-color"
                 :style="{'background-color': account.color}">
            </div>
          </template>
          <template #icon class="account-asset-item">
            <img :src="getAssetIcon(asset)" class="asset-icon" />
          </template>
          {{ getAssetName(asset) }}
          <template #detail>
            {{ prettyBalance(account.balances[asset], asset) }} {{asset}}
          </template>
          <template #detail-sub v-if="account.fiatBalances[asset]">
            ${{ formatFiat(account.fiatBalances[asset]) }}
          </template>
      </ListItem>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import ListItem from '@/components/ListItem'
import { prettyBalance, formatFiat } from '@/utils/coinFormatter'
import { getAssetIcon } from '@/utils/asset'
import { getAccountIcon } from '@/utils/accounts'
import cryptoassets from '@/utils/cryptoassets'
import PlusIcon from '@/assets/icons/plus_icon.svg'
import MinusIcon from '@/assets/icons/minus_icon.svg'
import { shortenAddress } from '@/utils/address'

export default {
  components: {
    ListItem,
    PlusIcon,
    MinusIcon
  },
  props: ['search', 'accounts'],
  data () {
    return {
      expandedAccounts: []
    }
  },
  computed: {
    filteredItems () {
      if (!this.search) return this.accounts

      const search = this.search.toUpperCase()
      const assetComparator = asset => {
        return asset.toUpperCase().includes(search) || cryptoassets[asset].name.toUpperCase().includes(search)
      }

      return this.accounts
        .filter(account => account.assets.find(assetComparator))
        .map(account => ({ ...account, assets: account.assets.filter(assetComparator) }))
    }
  },
  methods: {
    getAccountIcon,
    getAssetIcon,
    prettyBalance,
    formatFiat,
    shortenAddress,
    getAssetName (asset) {
      return cryptoassets[asset] ? cryptoassets[asset].name : asset
    },
    toggleExpandedAccounts (id) {
      if (this.expandedAccounts.includes(id)) {
        this.expandedAccounts = this.expandedAccounts.filter(account => account.id === id)
      } else {
        this.expandedAccounts.push(id)
      }
    },
    selectItem (account, asset) {
      this.$emit('item-selected', { account, asset })
    },
    shouldExpandAccount (account) {
      return this.expandedAccounts.includes(account.id) || this.search
    }
  }
}
</script>
<style lang="scss">
.ledger-tag {
  color: #4763CD;
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
</style>
