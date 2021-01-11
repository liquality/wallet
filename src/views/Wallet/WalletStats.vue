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
         <div class="wallet-actions">
          <router-link to="/assets/send"><button class="account_actions_button">
            <div class="wallet-actions_button_wrapper"><SendIcon class="account_actions_button_icon" /></div>Send
          </button></router-link>
          <router-link to="/assets/receive"><button class="account_actions_button">
            <div class="wallet-actions_button_wrapper"><ReceiveIcon class="account_actions_button_icon" /></div>Receive
          </button></router-link>
          <router-link to="/assets/swap"><button class="account_actions_button">
            <div class="wallet-actions_button_wrapper"><SwapIcon class="account_actions_button_icon account_actions_button_swap" /></div>Swap
          </button></router-link>
        </div>
      </div>
      <span v-else>Loading ...</span>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import BN from 'bignumber.js'
import cryptoassets from '@/utils/cryptoassets'
import SendIcon from '@/assets/icons/arrow_send.svg'
import ReceiveIcon from '@/assets/icons/arrow_receive.svg'
import SwapIcon from '@/assets/icons/arrow_swap.svg'

export default {
  components: {
    SendIcon,
    ReceiveIcon,
    SwapIcon
  },
  computed: {
    ...mapState([
      'fiatRates'
    ]),
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
      font-size: 50px;
      line-height: 61px;
    }

    .wallet-actions {
       display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto;

      &_button {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 70px;
        border: 0;
        cursor: pointer;
        color: $color-text-secondary;
        background: none;

        &.disabled {
          opacity: 0.5;
          cursor: auto;
        }

        &_wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 44px;
          height: 44px;
          background: #ffffff;
          border-radius: 50%;
          margin-bottom: 4px;
        }

        &_icon {
          width: 16px;
          height: 16px;
        }

        &_swap {
          height: 30px;
        }
    }
  }
}
</style>
