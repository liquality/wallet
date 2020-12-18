<template>
   <div v-if="networkWalletBalances">
       <ListItem v-for="([asset, balance]) in orderedBalances"
                 :key="asset"
                 :to="'/account/' + asset">
          <template #icon>
            <img :src="getAssetIcon(asset)" class="asset-icon" />
          </template>
          {{ getAssetName(asset) }}
          <template #detail>
            {{ prettyBalance(balance, asset) }} {{asset}}
          </template>
          <template #detail-sub v-if="fiatRates[asset]">
            ${{prettyFiat(balance, asset)}}
          </template>
      </ListItem>
   </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import ListItem from '@/components/ListItem'
import { prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import { getAssetIcon } from '@/utils/asset'
import cryptoassets from '@/utils/cryptoassets'

export default {
  components: {
    ListItem
  },
  computed: {
    ...mapState(['fiatRates']),
    ...mapGetters(['orderedBalances', 'networkWalletBalances'])
  },
  methods: {
    getAssetIcon,
    prettyBalance,
    prettyFiat (amount, asset) {
      amount = cryptoassets[asset].unitToCurrency(amount)
      return prettyFiatBalance(amount, this.fiatRates[asset])
    },
    getAssetName (asset) {
      return cryptoassets[asset] ? cryptoassets[asset].name : asset
    }
  }
}
</script>

<style lang="scss">

</style>
