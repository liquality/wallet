<template>
  <div class="swap-confirm wrapper form text-center">
    <div class="wrapper_top form">
      <div class="form-group">
        <label>Pay</label>
        <p class="confirm-value">{{amount}} {{asset}}</p>
      </div>
      <div class="form-group">
        <label>Receive</label>
        <p class="confirm-value">{{toAmount}} {{toAsset}}</p>
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
      <SwapInfo />
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="$router.go(-1)">Cancel</button>
        <button class="btn btn-primary btn-lg btn-block btn-icon" @click="send"><SwapIcon /> Initiate Swap</button>
      </div>

    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import cryptoassets from '@liquality/cryptoassets'
import { shortenAddress } from '../../utils/address'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import SwapInfo from '@/components/v2/SwapInfo'

export default {
  components: {
    SwapIcon,
    SwapInfo
  },
  props: ['agent', 'asset', 'toAsset', 'amount', 'toAmount', 'rate', 'sendTo'],

  computed: {
    ...mapState(['activeNetwork', 'activeWalletId'])
  },

  methods: {
    ...mapActions(['newSwap']),
    shortenAddress,
    async send () {
      const fromAmount = cryptoassets[this.asset.toLowerCase()].currencyToUnit(this.amount)

      await this.newSwap({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        agent: this.agent,
        from: this.asset,
        to: this.toAsset,
        fromAmount,
        sendTo: this.sendTo,
        auto: false
      })

      this.$router.replace(`/account/${this.asset}`)
    }
  }
}
</script>

<style lang="scss">
.swap-confirm {

}
</style>
