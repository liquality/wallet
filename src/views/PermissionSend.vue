<template>
  <div class="permission-eth-send wrapper form text-center">
    <div class="wrapper_top form">
      <div class="form-group">
        <label>Send</label>
        <p class="confirm-value" :style="getAssetColorStyle(asset)">{{sendAmount}} {{asset}}</p>
        <p class="text-muted">${{prettyFiatBalance(sendAmount, fiatRates[asset])}}</p>
      </div>
      <div class="form-group">
        <label>To</label>
        <p class="confirm-value">{{shortenAddress(this.sendAddress)}}</p>
      </div>
      <div class="form-group">
        <label>Network Speed / Fee</label>
        <div class="permission-eth-send_fees">
          <FeeSelector :asset="asset" v-model="selectedFee" v-bind:fees="assetFees" />
        </div>
      </div>
      {{ sendData }}
    </div>

    <div class="wrapper_bottom">
      <Warning />
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
import cryptoassets from '@liquality/cryptoassets'
import FeeSelector from '@/components/FeeSelector'
import { prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import { getChainFromAsset, getAssetColorStyle, getAssetIcon } from '@/utils/asset'
import { shortenAddress } from '@/utils/address'
import SpinnerIcon from '@/assets/icons/spinner.svg'

export default {
  components: {
    SpinnerIcon,
    FeeSelector
  },
  data () {
    return {
      asset: 'ETH',
      selectedFee: 'average',
      loading: false,
      replied: false
    }
  },
  methods: {
    ...mapActions(['replyPermission', 'updateFees', 'sendTransaction']),
    prettyBalance,
    prettyFiatBalance,
    getAssetIcon,
    getAssetColorStyle,
    shortenAddress,
    reply (allowed) {
      this.replyPermission({
        request: this.request,
        allowed
      })

      this.replied = true

      window.close()
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'balances', 'fees', 'fiatRates']),
    assetChain () {
      return getChainFromAsset(this.asset)
    },
    sendAddress () {
      return this.request.args[0]
    },
    sendAmount () {
      return cryptoassets[this.asset].unitToCurrency(this.request.args[1]).toNumber()
    },
    sendData () {
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
    if (this.replied) return

    this.reply(false)
  }
}
</script>

<style lang="scss">
.permission-eth-send {
  &_fees {
    text-align: center;
    margin: 6px 0;
  }
}
</style>
