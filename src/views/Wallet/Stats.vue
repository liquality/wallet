<template>
   <div class="wallet-stats">
      <div v-if="loaded">
        <div>
            <span class="wallet-stats_total">
                {{totalFiatBalance}}
            </span>
            <span>USD</span>
        </div>
        <span>
            {{assets.length}} Asset{{ assets.length === 1 ? '' : 's' }}
        </span>
      </div>
      <span v-else>Loading ...</span>
    </div>
</template>

<script>
import BN from 'bignumber.js'
import cryptoassets from '@/utils/cryptoassets'

export default {
  props: [
    'loaded',
    'assets',
    'fiatRates'
  ],
  computed: {
    totalFiatBalance () {
      const total = this.assets.reduce((accum, [asset, balance]) => {
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
    text-align: center;
    display: flex;
    flex: 0 0 auto;
    width: 100%;
    height: 225px;
    justify-content: center;
    align-items: center;
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
