<template>
  <div class="receive wrapper form text-center">
    <div class="wrapper_top form">
      <div class="form-group">
        <label>Your Current Bitcoin Address</label>
        <p class="receive_address">{{address}}</p>
        <p>Scan this QR code with a mobile wallet to send funds to this address.</p>
        <div v-if="qrcode" v-html="qrcode" class="receive_qr"></div>
      </div>
    </div>
    
    <div class="wrapper_bottom">
      <button class="btn btn-primary btn-lg btn-block btn-icon" @click="copy"><CopyIcon /> Copy Address</button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import QRCode from 'qrcode'
import CopyIcon from '@/assets/icons/copy.svg'

export default {
  components: {
    CopyIcon
  },
  data () {
    return {
      qrcode: null
    }
  },
  props: {
    asset: String
  },
  computed: {
    ...mapState(['addresses', 'activeNetwork', 'activeWalletId']),
    address () {
      if (!this.addresses[this.activeNetwork]) return false
      if (!this.addresses[this.activeNetwork][this.activeWalletId]) return false
      if (!this.addresses[this.activeNetwork][this.activeWalletId][this.asset]) return false

      return this.addresses[this.activeNetwork][this.activeWalletId][this.asset]._address
    },
  },
  async created () {
    const unusedAddress = await this.getUnusedAddresses({ network: this.activeNetwork, walletId: this.activeWalletId, assets: [this.asset] })
    const uri = [
      this.asset.toLowerCase(),
      unusedAddress._address
    ].join(':')

    QRCode.toString(uri, {
      type: 'svg',
      margin: 0
    }, (err, svg) => {
      if (err) throw err

      this.qrcode = svg
    })
  },
  methods: {
    ...mapActions(['getUnusedAddresses']),
    copy () {
      const copyText = document.querySelector(".receive_address");
      const tempInput = document.createElement("input");
      tempInput.value = copyText.innerHTML;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
    }
  }
}
</script>

<style lang="scss">
.receive {
  &_qr {
    margin-top: 30px;
  }
}
</style>
