<template>
  <div>
    <div v-for="account in filteredItems" :key="account.id">
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
          {{ account.name }}
          <template #sub-title>
            {{ account.addresses && account.addresses[0] ? shortenAddress(account.addresses[0]) : '' }}
          </template>
          <template #detail>
            <div class="detail-content">
              <div class="ledger-tag"
                   v-if="account.type && account.type.includes('ledger')">
              Ledger
            </div>
            <div>
              {{ prettyBalance(account.balances[account.assets[0]], account.assets[0]) }} {{account.assets[0]}}
            </div>
            </div>
          </template>
          <template #detail-sub v-if="account.totalFiatBalance">
            ${{ formatFiat(account.totalFiatBalance) }}
          </template>
      </ListItem>
      <div v-else>
        <ListItem
          @item-selected="toogleShowAccountAssets(account.id)"
        >
          <template #prefix>
             <div class="account-color"
                 :style="{'background-color': account.color}">
            </div>
            <div class="prefix-icon-container">
              <MinusIcon v-if="showAccountAssets[account.id] === true"
              class="prefix-icon"/>
              <PlusIcon v-else class="prefix-icon"/>
            </div>
          </template>
          <template #icon>
            <img :src="getAccountIcon(account.chain)"
                 class="asset-icon" />
          </template>
          {{ account.name }}
          <template #sub-title>
            {{ account.addresses && account.addresses[0] ? shortenAddress(account.addresses[0]) : '' }}
          </template>
          <template #detail>
            <div class="ledger-tag"
                   v-if="account.type && account.type.includes('ledger')">
              Ledger
            </div>
          </template>
          <template #detail-sub v-if="account.totalFiatBalance">
            ${{ formatFiat(account.totalFiatBalance) }}
          </template>
      </ListItem>
      <div class="account-assets"
           :class="{ active: showAccountAssets[account.id] === true}">
        <ListItem v-for="asset in account.assets"
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
      showAccountAssets: {},
      filteredItems: []
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
    toogleShowAccountAssets (id) {
      this.showAccountAssets[id] = !this.showAccountAssets[id]
    },
    selectItem (account, asset) {
      this.$emit('item-selected', { account, asset })
    },
    makeSearch (newSearch, oldSearch) {
      if (newSearch && newSearch !== oldSearch) {
        this.filteredItems = this.accounts.filter(
          account =>
            account.chain.toUpperCase().includes(newSearch.toUpperCase()) ||
            account.assets.includes(newSearch.toUpperCase())
        )
      } else {
        this.filteredItems = [...this.accounts]
      }
    },
    onUpdateAccounts () {
      this.showAccountAssets = {
        ...this.accounts.map(a => a.id).reduce(
          (accum, id) => {
            return {
              ...accum,
              [id]: false
            }
          }, {}),
        ...this.showAccountAssets
      }

      this.makeSearch(this.search)
    }
  },
  created () {
    this.onUpdateAccounts()
  },
  watch: {
    search (newSearch, oldSearch) {
      if (newSearch && newSearch !== oldSearch) {
        this.makeSearch(newSearch, oldSearch)
      }
    },
    accounts () {
      this.onUpdateAccounts()
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
