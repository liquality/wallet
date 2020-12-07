<template>
  <div class="permission-send wrapper form text-center">
    <div class="wrapper_top form">
      <div class="form-group">
        <label>Send</label>
        <p class="confirm-value" :style="getAssetColorStyle(asset)">{{amount}} {{asset}}</p>
        <p class="text-muted">${{prettyFiatBalance(amount, fiatRates[asset])}}</p>
      </div>
      <div class="form-group">
        <label>To</label>
        <p class="confirm-value">{{shortAddress}}</p>
      </div>
      <div class="form-group">
        <label>Network Speed / Fee</label>
        <div class="permission-send_fees">
          <FeeSelector :asset="asset" v-model="selectedFee" v-bind:fees="assetFees" v-bind:fiatRates="fiatRates"/>
        </div>
      </div>
      <div v-if="data" class="permission-send_data">
        <label @click="toggleshowData"><ChevronDown v-if="showData" class="permission-send_data_icon-down" /><ChevronRight class="permission-send_data_icon-right" v-else />Data</label>
        <div class="permission-send_data_code" v-if="showData">{{data}}</div>
      </div>
    </div>

    <div class="wrapper_bottom">
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="reply(false)">Cancel</button>
        <button class="btn btn-primary btn-lg btn-icon" @click="reply(true)" :disabled="loading">
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else>Confirm</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
import FeeSelector from '@/components/FeeSelector'
import { prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import { getChainFromAsset, getAssetColorStyle } from '@/utils/asset'
import { shortenAddress } from '@/utils/address'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ChevronDown from '@/assets/icons/chevron_down.svg'
import ChevronRight from '@/assets/icons/chevron_right.svg'

export default {
  components: {
    SpinnerIcon,
    ChevronDown,
    ChevronRight,
    FeeSelector
  },
  data () {
    return {
      showData: false,
      selectedFee: 'average',
      loading: false,
      replied: false
    }
  },
  methods: {
    ...mapActions(['replyPermission', 'updateFees']),
    prettyBalance,
    prettyFiatBalance,
    getAssetColorStyle,
    toggleshowData () {
      this.showData = !this.showData
    },
    async reply (allowed) {
      const fee = this.feesAvailable ? this.assetFees[this.selectedFee].fee : undefined

      // TODO: does not account for request having fee parameter. Make fee static in that case?
      if (![2, 3].includes(this.request.args.length)) throw new Error('Send request must contain 2 or 3 arguments.')

      const requestWithFee = {
        ...this.request,
        args: [
          ...this.request.args,
          ...(this.request.args.length === 2 ? [undefined, fee] : [fee])
        ]
      }

      this.loading = true

      try {
        await this.replyPermission({
          request: requestWithFee,
          allowed
        })
        this.replied = true
        window.close()
      } finally {
        this.loading = false
      }
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'fees', 'fiatRates']),
    asset () {
      return this.request.asset
    },
    assetChain () {
      return getChainFromAsset(this.asset)
    },
    address () {
      return this.request.args[0]
    },
    shortAddress () {
      return this.address ? shortenAddress(this.address) : 'New Contract'
    },
    amount () {
      if (!this.request.args[1]) return 0
      return cryptoassets[this.asset].unitToCurrency(this.request.args[1]).toNumber()
    },
    data () {
      return this.request.args[2]
    },
    assetFees () {
      return this.fees[this.activeNetwork]?.[this.activeWalletId]?.[this.assetChain]
    },
    feesAvailable () {
      return this.assetFees && Object.keys(this.assetFees).length
    },
    request () {
      return {
        ...this.$route.query,
        args: JSON.parse(this.$route.query.args)
      }
    }
  },
  created () {
    this.updateFees({ asset: this.asset })
  },
  beforeDestroy () {
    // TODO: need to reply correctly when window is closed
    if (this.replied) return

    this.reply(false)
  }
}
</script>

<style lang="scss">
.permission-send {
  &_fees {
    text-align: center;
    margin: 6px 0;
  }

  &_data {
    border-top: 1px solid $hr-border-color;
    border-bottom: 1px solid $hr-border-color;
    padding: 10px 0;

    &_icon-right {
      width: 6px;
      margin-right: 12px;
    }

    &_icon-down {
      width: 12px;
      margin-right: 6px;
    }

    label {
      display: flex;
      align-items: center;
      text-align: left;
    }

    &_code {
      margin-left: 18px;
      max-height: 120px;
      text-align: left;
      overflow-y: auto;
      word-wrap: break-word;
      font-size: $font-size-sm;
    }
  }
}
</style>
