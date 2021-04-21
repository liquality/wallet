<template>
   <div class="wallet-divider">
     <div class="divider-color"
          v-for="items in items"
          :key="items.asset"
          :style="{
            width: `${items.percentage}%`,
            backgroundColor: items.color
          }"
           v-tooltip="{ content: `${items.asset}: ${items.percentageRounded}%`} ">
    </div>
   </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
// import BN from 'bignumber.js'
// import cryptoassets from '@/utils/cryptoassets'
// import { unitToCurrency } from '@liquality/cryptoassets'

export default {
  computed: {
    ...mapState(['fiatRates']),
    ...mapGetters([]),
    items () {
      // const top = [...this.assetsWithBalance].splice(0, 9)
      // const total = top.reduce((accum, [asset, balance]) => {
      //   const value = unitToCurrency(cryptoassets[asset], balance)
      //   const balanceFiat = this.fiatRates[asset] ? BN(value).times(this.fiatRates[asset]) : 0
      //   return accum.plus(balanceFiat)
      // }, BN(0))

      // return top.map(([asset, balance]) => {
      //   const cryptoasset = cryptoassets[asset]
      //   const value = unitToCurrency(cryptoasset, balance)
      //   const balanceFiat = this.fiatRates[asset] ? BN(value).times(this.fiatRates[asset]) : 0
      //   const percentage = (BN(balanceFiat).times(100)).div(total).toNumber()
      //   return {
      //     asset,
      //     percentage,
      //     percentageRounded: Math.round(percentage),
      //     balance: balanceFiat,
      //     color: cryptoasset.color
      //   }
      // })

      return []
    }
  }
}
</script>

<style lang="scss">
.wallet-divider {
    width: 100%;
    height: 9px;
    border-top: 1px solid $hr-border-color;
    display: flex;

    .divider-color {
      height: 9px;
    }
  }
</style>
