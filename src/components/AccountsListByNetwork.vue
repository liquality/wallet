<template>
    <div>
    <div v-for="(account, index) in filteredItems" :key="account.id" :id="account.chain.toUpperCase()">
      <ListItem @item-selected="selectItem(account)"
                :item-class="account.id === accountId ? 'active' : ''" >
        <template #prefix>
          <input type="radio" class="radio-button" :value="index" v-model.number="selectedRadioButton">
        </template>
        <template #icon>
          <img :src="getAccountIcon(account.chain)"
              class="asset-icon" />
        </template>
        {{ formatAccountName(account) }}
        <template #sub-title>
          {{ account.addresses && account.addresses[0] ? shortenAddress(account.addresses[0]) : '' }}
        </template>
        <template #detail>
          <div class="detail-content">
            <div class="ledger-tag"
                v-if="account.type && account.type.includes('ledger')">
            Ledger
            </div>
          </div>
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
      filteredItems: [],
      selectedRadioButton: -1
    }
  },
  methods: {
    getAccountIcon,
    getAssetIcon,
    prettyBalance,
    formatFiat,
    shortenAddress,
    selectItem (account) {
      this.setRadioButton(account)
      this.$emit('item-selected', { account })
    },
    makeSearch (newSearch) {
      if (newSearch) {
        this.resetRadioButtons()
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
    setRadioButton (account) {
      this.selectedRadioButton = this.filteredItems.indexOf(account)
    },
    resetRadioButtons () {
      this.selectedRadioButton = -1
    },
    onUpdateAccounts () {
      this.makeSearch(this.search)
    },
    formatAccountName (account) {
      const index = account.name.lastIndexOf(' ')
      return account.name.substr(0, index) + ' Account ' + account.name.substr(index)
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

.list-item {
  border: 1px solid #D9DFE5;
}

.radio-button {
  position: absolute;
  width: 12px;
  height: 12px;
  left: 10px;
  right: 10px;
  top: 24px;
  border: 1px solid #A8AEB7;
}

.selected-item {
  background-color: #ffffff;
}
</style>
