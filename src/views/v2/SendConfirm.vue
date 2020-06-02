<template>
  <div class="send-confirm wrapper form text-center">
    <div class="wrapper_top form">
      <div class="form-group">
        <label>Send</label>
        <p class="confirm-value">{{sendAmount}} {{asset}}</p>
      </div>
      <div class="form-group">
        <label>To</label>
        <p class="confirm-value">{{shortenAddress(this.sendAddress)}}</p>
      </div>
    </div>
    
    <div class="wrapper_bottom">
      <button class="btn btn-primary btn-lg btn-block btn-icon" @click="send"><SendIcon /> Send</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import cryptoassets from '@liquality/cryptoassets'
import { shortenAddress } from '../../utils/address'
import SendIcon from '@/assets/icons/arrow_send.svg'

export default {
  
  components: {
    SendIcon
  },

  props: ['asset', 'sendAddress', 'sendAmount'],

  computed: {
    ...mapState(['activeNetwork', 'activeWalletId'])
  },

  methods: {
    ...mapActions(['sendTransaction']),
    shortenAddress,
    async send () {
      const amount = cryptoassets[this.asset.toLowerCase()].currencyToUnit(this.sendAmount).toNumber()

      await this.sendTransaction({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        asset: this.asset,
        amount,
        to: this.sendAddress,
        from: this.address
      })
      
      this.$router.replace(`/account/${this.asset}`)
    }
  }
}
</script>

<style lang="scss">
.send-confirm {
  .btn.btn-icon svg {
    height: 12px;
  }
}
</style>
