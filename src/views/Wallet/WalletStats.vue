<template>
   <div class="wallet-stats">
      <div v-if="networkAssetsLoaded">
        <div>
            <span class="wallet-stats_total">
                {{ totalFiatBalance }}
            </span>
            <span>USD</span>
        </div>
        <span>
            {{assetsWithBalance.length}} Asset{{ assetsWithBalance.length === 1 ? '' : 's' }}
        </span>
      </div>
      <span v-else>Loading ...</span>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import BN from 'bignumber.js'
import cryptoassets from '@/utils/cryptoassets'

export default {
  computed: {
    ...mapState(['fiatRates']),
    ...mapGetters(['networkAssetsLoaded', 'assetsWithBalance']),
    totalFiatBalance () {
      const total = this.assetsWithBalance.reduce((accum, [asset, balance]) => {
        balance = cryptoassets[asset].unitToCurrency(balance)
        const balanceFiat = this.fiatRates[asset] ? BN(balance).times(this.fiatRates[asset]) : 0
        return accum.plus(balanceFiat)
      }, BN(0))
      return total.toFormat(2)
    }
  }
}
</script>

<style lang="scss">
.wallet-stats {
    display: flex;
    height: 225px;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: $brand-gradient-primary;
    color: $color-text-secondary;
    font-size: $font-size-lg;

    &_total {
      font-size: $h1-font-size;
      line-height: $h1-font-size;
      margin-right: 10px;
    }
  }
</style>
