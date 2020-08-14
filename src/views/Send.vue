<template>
  <div class="send wrapper form">
    <div class="wrapper_top form">
      <div class="form-group">
        <label for="address">Send to</label>
        <div class="input-group">
          <input type="text" v-model="sendAddress" class="form-control form-control-sm" id="address" placeholder="Address" autocomplete="off" required>
        </div>
        <small v-if="sendAddress && !isValidAddress" class="text-danger">Invalid address</small>
      </div>
      <div class="form-group">
        <label for="amount">Amount</label>
        <div class="input-group">
          <input type="number" :style="getAssetColorStyle(asset)" v-model="sendAmount" class="form-control" id="amount" placeholder="0.00" required>
          <div class="input-group-append">
            <span class="input-group-text">{{asset}}</span>
          </div>
        </div>
        <small class="form-text d-flex">
          <div class="text-right w-100">
            <span class="text-muted">Balance&nbsp;</span>
            <span>{{balance}} {{asset}}</span>
          </div>
        </small>
      </div>
      <div class="form-group" v-if="feesAvailable">
        <label>Network Speed/Fee</label>
        <div>
          <FeeSelector :asset="asset" v-model="selectedFee" v-bind:fees="assetFees" />
        </div>
      </div>
    </div>

    <div class="wrapper_bottom">
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="$router.go(-1)">Cancel</button>
        <button class="btn btn-primary btn-lg" @click="send" :disabled="!canSend">Continue</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import BN from 'bignumber.js'
import cryptoassets from '@liquality/cryptoassets'
import FeeSelector from '@/components/FeeSelector'
import { prettyBalance } from '@/utils/coinFormatter'
import { getChainFromAsset, getAssetColorStyle } from '@/utils/asset'

export default {
  components: {
    FeeSelector
  },
  data () {
    return {
      sendAmount: 0,
      sendAddress: null,
      selectedFee: 'average'
    }
  },
  props: {
    asset: String
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'balances', 'fees']),
    assetChain () {
      return getChainFromAsset(this.asset)
    },
    assetFees () {
      return this.fees[this.activeNetwork]?.[this.activeWalletId]?.[this.assetChain]
    },
    feesAvailable () {
      return this.assetFees && Object.keys(this.assetFees).length
    },
    isValidAddress () {
      return cryptoassets[this.asset.toLowerCase()].isValidAddress(this.sendAddress)
    },
    canSend () {
      if (!this.sendAddress) return false

      const sendAmount = BN(this.sendAmount)

      if (sendAmount.gt(this.balance) || sendAmount.lte(0)) return false

      if (!this.isValidAddress) return false

      return true
    },
    balance () {
      const rawBalance = this.balances[this.activeNetwork][this.activeWalletId][this.asset]
      return prettyBalance(rawBalance, this.asset)
    }
  },
  methods: {
    prettyBalance,
    getAssetColorStyle,
    ...mapActions(['updateFees']),
    async send () {
      const fee = this.feesAvailable ? this.assetFees[this.selectedFee].fee : undefined
      this.$router.push({
        name: 'SendConfirm',
        params: {
          asset: this.asset, sendAddress: this.sendAddress, sendAmount: this.sendAmount, fee
        }
      })
    }
  },
  created () {
    this.updateFees({ asset: this.asset })
  }
}
</script>

<style lang="scss">
.send {

}
</style>
