<template>
  <div class="swap-confirm wrapper form text-center">
    <div class="wrapper_top form">
      <div class="form-group">
        <label>Pay</label>
        <p class="confirm-value" :style="getAssetColorStyle(asset)">{{amount}} {{asset}}</p>
      </div>
      <div class="form-group">
        <label>Receive</label>
        <p class="confirm-value" :style="getAssetColorStyle(toAsset)">{{toAmount}} {{toAsset}}</p>
      </div>
      <div class="form-group" v-if="sendTo">
        <label>At</label>
        <p class="confirm-value">{{shortenAddress(sendTo)}}</p>
      </div>
      <div class="swap-rate form-group">
        <label>Rate</label>
        <p><span class="swap-rate_base">1 {{asset}} =</span><span class="swap-rate_value">&nbsp;{{rate}}</span><span class="swap-rate_term">&nbsp;{{toAsset}}</span></p>
      </div>
    </div>

    <div class="wrapper_bottom">
      <div class="swap-info">
        <Warning />
        <div class="media"><ClockIcon class="swap-info_clock" /><p class="text-muted media-body">If the swap doesn’t complete in 3 hours, your funds will be released in 6 hours at {{expiration}}</p></div>
      </div>
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="$router.go(-1)">Cancel</button>
        <button class="btn btn-primary btn-lg btn-block btn-icon" @click="send" :disabled="loading">
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else><SwapIcon /> Initiate Swap</template>
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import cryptoassets from '@liquality/cryptoassets'
import { shortenAddress } from '@/utils/address'
import { getAssetColorStyle } from '@/utils/asset'
import Warning from '@/components/Warning'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ClockIcon from '@/assets/icons/clock.svg'
import { add, format } from 'date-fns'

export default {
  components: {
    Warning,
    ClockIcon,
    SwapIcon,
    SpinnerIcon
  },
  props: ['agent', 'asset', 'toAsset', 'amount', 'toAmount', 'rate', 'sendTo', 'fee', 'toFee'],
  data () {
    return {
      loading: false
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId']),
    expiration: function () {
      return format(add(new Date(), { hours: 6 }), 'h:mm a')
    }
  },
  methods: {
    ...mapActions(['newSwap']),
    shortenAddress,
    getAssetColorStyle,
    async send () {
      this.loading = true
      const fromAmount = cryptoassets[this.asset.toLowerCase()].currencyToUnit(this.amount)

      await this.newSwap({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        agent: this.agent,
        from: this.asset,
        to: this.toAsset,
        fromAmount,
        sendTo: this.sendTo,
        auto: false,
        fee: this.fee,
        claimFee: this.toFee
      })

      this.$router.replace(`/account/${this.asset}`)
    }
  }
}
</script>

<style lang="scss">
.swap-confirm {
  .swap-info {
    text-align: left;

    &_clock {
      margin-top: 6px;
      margin-right: 8px;
      height: 20px;
      width: 20px;
      object-fit: contain;
    }
    p {
      font-size: $font-size-sm;
    }
  }
}
</style>
