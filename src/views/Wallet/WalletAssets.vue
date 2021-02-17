<template>
  <div>
    <div v-for="account in accountsData" :key="account.id">
      <ListItem>
          <template #icon>
            <img :src="getAssetIcon(account.chain)"
                 class="asset-icon" />
          </template>
          *** {{ account.name }}
          <template #detail>
            <span v-if="account.type && account.type.includes('ledger')">
              Ledger
            </span>
            <span v-else>
              Default
            </span>
          </template>
          <template #detail-sub v-if="account.totalFiatBalance">
            ${{ formatFiat(account.totalFiatBalance) }}
          </template>
      </ListItem>
      <ListItem v-for="asset in account.assets"
                 :key="asset"
                 :to="`/account/${account.id}/${asset}`">
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
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import ListItem from '@/components/ListItem'
import { prettyBalance, formatFiat } from '@/utils/coinFormatter'
import { getAssetIcon } from '@/utils/asset'
import cryptoassets from '@/utils/cryptoassets'

export default {
  components: {
    ListItem
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
    }
  }
}
</script>

<style lang="scss">

</style>
