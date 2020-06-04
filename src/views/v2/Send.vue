<template>
  <div class="send wrapper form">
    <div class="wrapper_top form">
      <div class="form-group">
        <label for="address">Send to</label>
        <div class="input-group">
          <input type="text" v-model="sendAddress" class="form-control form-control-sm" id="address" placeholder="Address" autocomplete="off" required>
        </div>
      </div>
      <div class="form-group">
        <label for="amount">Amount</label>
        <div class="input-group">
          <input type="number" v-model="sendAmount" class="form-control" id="amount" placeholder="0.00" required>
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

import { prettyBalance } from '@/utils/coinFormatter'

export default {
  data () {
    return {
      loading: false,
      sendAmount: 0,
      sendAddress: null
    }
  },
  props: {
    asset: String
  },
  computed: {
    ...mapState(['addresses', 'activeNetwork', 'activeWalletId', 'balances']),
    canSend () {
      if (!this.sendAddress) return false

      const sendAmount = BN(this.sendAmount)

      if (sendAmount.gt(this.balance) || sendAmount.lte(0)) return false

      return true
    },
    balance () {
      const rawBalance = this.balances[this.activeNetwork][this.activeWalletId][this.asset]
      return prettyBalance(rawBalance, this.asset)
    }
  },
  methods: {
    prettyBalance,
    ...mapActions(['sendTransaction']),
    async send () {
      this.$router.push({
        name: 'SendConfirm',
        params: {
          asset: this.asset, sendAddress: this.sendAddress, sendAmount: this.sendAmount
        }
      })
    }
  }

}
</script>

<style lang="scss">
.send {

}
</style>
