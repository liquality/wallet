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
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="$router.go(-1)">Cancel</button>
        <button class="btn btn-primary btn-lg btn-icon" @click="send" :disabled="loading">
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else><SendIcon /> Send</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import cryptoassets from '@liquality/cryptoassets'
import { shortenAddress } from '@/utils/address'
import SendIcon from '@/assets/icons/arrow_send.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'

export default {
  components: {
    SendIcon,
    SpinnerIcon
  },
  props: ['asset', 'sendAddress', 'sendAmount', 'fee'],
  data () {
    return {
      loading: false
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId'])
  },
  methods: {
    ...mapActions(['sendTransaction']),
    shortenAddress,
    async send () {
      this.loading = true
      const amount = cryptoassets[this.asset.toLowerCase()].currencyToUnit(this.sendAmount).toNumber()

      await this.sendTransaction({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        asset: this.asset,
        amount,
        to: this.sendAddress,
        fee: this.fee
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
