<template>
  <div class="send wrapper form">
    <div class="wrapper_top form">
      <div class="form-group">
        <label for="address">Send to</label>
        <div class="input-group">
          <input type="text" v-model="sendAddress" class="form-control form-control-sm" id="address" placeholder="Address">
        </div>
      </div>
      <div class="form-group">
        <label for="amount">Amount</label>
        <div class="input-group">
          <input type="number" v-model="sendAmount" class="form-control" id="amount" placeholder="0.00">
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
      <button class="btn btn-primary btn-lg btn-block" @click="send">Continue</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import cryptoassets from '@liquality/cryptoassets'
import BN from 'bignumber.js'

import { prettyBalance } from '@/utils/coinFormatter'

export default {
  data () {
    return {
      loading: false,
      sendAmount: 0,
      sendAddress: null,
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
    ...mapActions(['updateBalances', 'sendTransaction']),
    refresh () {
      this.updateBalances({ network: this.activeNetwork, walletId: this.activeWalletId })
    },
    async send () {
      this.loading = true

      const amount = cryptoassets[this.asset.toLowerCase()].currencyToUnit(this.sendAmount).toNumber()

      await this.sendTransaction({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        asset: this.asset,
        amount,
        to: this.sendAddress,
        from: this.address
      })

      this.sendAddress = null
      this.sendAmount = null
      
      this.$router.replace(`/account/${this.asset}`)
    }
  }

}
</script>

<style lang="scss">
.send {

}
</style>
