<template>
  <div>
    <div v-for="account in filteredItems" :key="account.id" :id="account.chain.toUpperCase()">
      <ListItem @item-selected="selectItem(account)"
                :item-class="account.id === accountId ? 'active' : ''">
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
              <div :id="account.assets[0]">
                {{ prettyBalance(account.balances[account.assets[0]], account.assets[0]) }} {{account.assets[0]}}
              </div>
            </div>
          </template>
          <template #detail-sub v-if="account.totalFiatBalance">
            ${{ formatFiat(account.totalFiatBalance) }}
          </template>
      </ListItem>
    </div>
  </div>
</template>

<script>
import ListItem from '@/components/ListItem'
import { prettyBalance, formatFiat } from '@/utils/coinFormatter'
import { getAssetIcon } from '@/utils/asset'
import { getAccountIcon } from '@/utils/accounts'
import { shortenAddress } from '@/utils/address'

export default {
  components: {
    ListItem
  },
  props: ['search', 'accounts', 'accountId'],
  data () {
    return {
      filteredItems: []
    }
  },
  methods: {
    getAccountIcon,
    getAssetIcon,
    prettyBalance,
    formatFiat,
    shortenAddress,
    selectItem (account) {
      this.$emit('item-selected', { account })
    },
    makeSearch (newSearch) {
      if (newSearch) {
        this.filteredItems = this.accounts.filter(
          account => {
            const search = newSearch.toUpperCase()
            return account.chain?.toUpperCase().includes(search) ||
                   account.assets.includes(search) ||
                   account.name?.toUpperCase().includes(search)
          }
        )
      } else {
        this.filteredItems = [...this.accounts]
      }
    },
    onUpdateAccounts () {
      this.makeSearch(this.search)
    }
  },
  created () {
    this.onUpdateAccounts()
  },
  watch: {
    search (newSearch, oldSearch) {
      if (newSearch !== oldSearch) {
        this.makeSearch(newSearch)
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

.selected-item {
        background-color: #ffffff;
}
</style>
