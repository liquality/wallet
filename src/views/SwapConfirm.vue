<template>
  <div class="swap-confirm wrapper form text-center">
    <div class="wrapper_top form">
      <div class="form-group">
        <label>Send</label>
        <p class="confirm-value" :style="getAssetColorStyle(asset)">{{amount}} {{asset}}</p>
        <p class="text-muted">${{prettyFiatBalance(amount, fiatRates[asset])}}</p>
      </div>
      <div class="form-group">
        <label>Receive</label>
        <p class="confirm-value" :style="getAssetColorStyle(toAsset)">{{toAmount}} {{toAsset}}</p>
      </div>
      <div class="form-group">
        <label>At</label>
        <p class="confirm-value">{{ sendTo ? shortenAddress(sendTo) : 'Wallet'}}</p>
      </div>
      <div class="swap-rate form-group">
        <label>Rate</label>
        <p><span class="swap-rate_base">1 {{asset}} =</span><span class="swap-rate_value">&nbsp;{{rate}}</span><span class="swap-rate_term">&nbsp;{{toAsset}}</span></p>
      </div>
      <div class="form-group">
        <label>Network Fees</label>
        <div v-for="(fee, asset) in totalFees" :key="asset">
          <strong>~ {{ fee }}</strong>&nbsp;<span class="text-muted">{{ asset }}</span>&nbsp;<span>(${{prettyFiatBalance(fee, fiatRates[asset])}})</span>
        </div>
      </div>
    </div>

    <div class="wrapper_bottom">
      <div class="swap-info">
        <div class="media"><ClockIcon class="swap-info_clock" /><p class="text-muted media-body">If the swap doesn’t complete in 3 hours, you will be refunded in 6 hours at {{expiration}}</p></div>
        <Warning />
      </div>
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" v-if="!loading" @click="$router.go(-1)">Cancel</button>
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
import { getChainFromAsset, getAssetColorStyle } from '@/utils/asset'
import { TX_TYPES, getTxFee } from '@/utils/fees'
import { prettyFiatBalance } from '@/utils/coinFormatter'
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
    ...mapState(['activeNetwork', 'activeWalletId', 'fiatRates']),
    expiration: function () {
      return format(add(new Date(), { hours: 6 }), 'h:mm a')
    },
    totalFees () {
      const fees = {}

      const assetChain = getChainFromAsset(this.asset)
      const initiationFee = getTxFee(this.asset, TX_TYPES.SWAP_INITIATION, this.fee)
      fees[assetChain] = initiationFee

      const toAssetChain = getChainFromAsset(this.toAsset)
      const claimFee = getTxFee(this.toAsset, TX_TYPES.SWAP_CLAIM, this.toFee)
      fees[toAssetChain] = toAssetChain in fees ? fees[toAssetChain].plus(claimFee) : claimFee

      if (this.sendTo) {
        const sendFee = getTxFee(this.toAsset, TX_TYPES.SEND, this.toFee)
        fees[toAssetChain] = toAssetChain in fees ? fees[toAssetChain].plus(sendFee) : sendFee
      }

      return fees
    }
  },
  methods: {
    ...mapActions(['newSwap']),
    shortenAddress,
    getAssetColorStyle,
    prettyFiatBalance,
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
