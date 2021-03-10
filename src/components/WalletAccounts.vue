<template>
  <div>
    <div v-for="account in accountsData" :key="account.id">
      <ListItem v-if="account.chain === 'BTC'"
                @item-selected="selectItem(account)">
          <template #prefix>
            <div>&nbsp;</div>
          </template>
          <template #icon>
            <img :src="getAssetIcon(account.chain)"
                 class="asset-icon" />
          </template>
          {{ account.name }}
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
            <MinusIcon v-if="showAccountAssets[account.id] === true"
              class="prefix-icon"/>
            <PlusIcon v-else class="prefix-icon"/>
          </template>
          <template #icon>
            <img :src="getAssetIcon(account.chain)"
                 class="asset-icon" />
          </template>
          {{ account.name }}
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
          <template #icon>
            <img :src="getAssetIcon(asset)" class="asset-icon" />
          </template>
          {{ getAssetName(asset) }}
          <template #detail v-if="account.balances[asset]">
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
import { mapState, mapGetters } from 'vuex'
import ListItem from '@/components/ListItem'
import { prettyBalance, formatFiat } from '@/utils/coinFormatter'
import { getAssetIcon } from '@/utils/asset'
import cryptoassets from '@/utils/cryptoassets'
import PlusIcon from '@/assets/icons/plus_icon.svg'
import MinusIcon from '@/assets/icons/minus_icon.svg'

export default {
  components: {
    ListItem,
    PlusIcon,
    MinusIcon
  },
  data () {
    return {
      showAccountAssets: {}
    }
  },
  computed: {
    ...mapState(['fiatRates', 'activeWalletId']),
    ...mapGetters(['accountsData'])
  },
  methods: {
    getAssetIcon,
    prettyBalance,
    formatFiat,
    getAssetName (asset) {
      return cryptoassets[asset] ? cryptoassets[asset].name : asset
    },
    toogleShowAccountAssets (id) {
      this.showAccountAssets[id] = !this.showAccountAssets[id]
    },
    selectItem (account, asset) {
      this.$emit('item-selected', { account, asset })
    }
  },
  created () {
    this.showAccountAssets = this.accountsData.map(a => a.id).reduce(
      (accum, id) => {
        return {
          ...accum,
          [id]: false
        }
      }, {})
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
  padding-left: 30px;
  height: auto;
  width: 100%;
  display: none;

  &.active {
    display: block;
  }
}

.prefix-icon {
  width: 12px;
}
</style>
