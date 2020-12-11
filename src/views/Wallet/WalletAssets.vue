<template>
   <div>
       <router-link v-for="([asset, balance]) in orderedBalances" :key="asset" v-bind:to="'/account/' + asset" >
        <div class="account-item d-flex align-items-center">
          <img :src="getAssetIcon(asset)" class="asset-icon account-item_icon" />
          <div class="account-item_name flex-fill">{{asset}}</div>
          <div class="account-item_balance">
            {{prettyBalance(balance, asset)}} {{asset}}
            <span v-if="fiatRates[asset]" class="account-item_balance_fiat">${{prettyFiat(balance, asset)}}</span>
          </div>
          <ChevronRightIcon class="account-item_chevron" />
        </div>
      </router-link>
   </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import ChevronRightIcon from '@/assets/icons/chevron_right.svg'
import { prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import { getAssetIcon } from '@/utils/asset'
import cryptoassets from '@/utils/cryptoassets'

export default {
  components: {
    ChevronRightIcon
  },
  computed: {
    ...mapState(['fiatRates']),
    ...mapGetters(['orderedBalances'])
  },
  methods: {
    getAssetIcon,
    prettyBalance,
    prettyFiat (amount, asset) {
      amount = cryptoassets[asset].unitToCurrency(amount)
      return prettyFiatBalance(amount, this.fiatRates[asset])
    }
  }
}
</script>

<style lang="scss">

</style>
