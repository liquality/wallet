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
          <router-link to="/assets/send"
                       class="wallet-actions-item send-action">
            <SendIcon/>
            Send
          </router-link>
          <router-link to="/assets/swap"
                       class="wallet-actions-item swap-action">
            <SwapIcon/>
            Swap
          </router-link>
          <router-link to="/assets/receive"
                       class="wallet-actions-item receive-action">
            <ReceiveIcon/>
            Receive
          </router-link>
        </div>
      </div>
      <span v-else>Loading ...</span>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import BN from 'bignumber.js'
import cryptoassets from '@/utils/cryptoassets'
import SendIcon from '@/assets/icons/send_o.svg'
import ReceiveIcon from '@/assets/icons/receive_o.svg'
import SwapIcon from '@/assets/icons/swap_o.svg'

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
      align-items: flex-end;
      padding-top: 10px;

      .wallet-actions-item {
        color: #ffffff;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 57px;

        svg {
          margin-bottom: 5px;
        }

        &.send-action {
          svg {
            width: 44px;
            height: 44px;
          }
          margin-right: 14px;
        }

        &.swap-action {
          svg {
            width: 57px;
            height: 57px;
          }
        }

        &.receive-action {
          margin-left: 14px;
          svg {
            width: 44px;
            height: 44px;
          }
        }
    }
  }
}
</style>
