<template>
  <div class="receive wrapper form text-center">
    <div class="wrapper_top form">
      <div class="form-group">
        <label>Your Current Bitcoin Address</label>
        <p>bc1q9wmf68e9ta0gjszruxe0shg8ft5mtpfzru7rfn</p>
        <p>Scan this QR code with a mobile wallet to send funds to this address.</p>
        <div v-if="qrcode" v-html="qrcode" class="receive_qr"></div>
      </div>
    </div>
    
    <div class="wrapper_bottom">
      <router-link to="/account/btc"><button class="btn btn-primary btn-lg btn-block btn-icon"><CopyIcon /> Copy Address</button></router-link>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import CopyIcon from '@/assets/icons/copy.svg'

export default {
  components: {
    CopyIcon
  },
  created () {
    QRCode.toString('pl', {type: 'svg', margin: 0}, (err, svg) => {
      if (err) throw err

      this.qrcode = svg
    })
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
