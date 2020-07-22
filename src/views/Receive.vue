<template>
  <div class="receive wrapper form text-center">
    <div class="wrapper_top form">
      <div class="form-group">
        <label>Your Current {{chainName}} Address</label>
        <p class="receive_address">{{address}}</p>
        <p>Scan this QR code with a mobile wallet to send funds to this address.</p>
        <div v-if="qrcode" v-html="qrcode" class="receive_qr"></div>
      </div>
    </div>

    <div class="wrapper_bottom">
      <Warning />
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="$router.go(-1)">Cancel</button>
        <button class="btn btn-primary btn-lg btn-icon" @click="copy">
          <template v-if="copied"><TickIcon /> Copied!</template>
          <template v-else><CopyIcon /> Copy Address</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import QRCode from 'qrcode'
import { getChainFromAsset } from '@/utils/asset'
import Warning from '@/components/Warning'
import CopyIcon from '@/assets/icons/copy.svg'
import TickIcon from '@/assets/icons/tick.svg'
import cryptoassets from '@liquality/cryptoassets'

export default {
  components: {
    Warning,
    CopyIcon,
    TickIcon
  },
  data () {
    return {
      qrcode: null,
      copied: false
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
    chainName () {
      const chain = getChainFromAsset(this.asset)
      return ({
        BTC: 'bitcoin',
        ETH: 'ethereum'
      })[chain]
    }

  },
  async created () {
    const unusedAddress = await this.getUnusedAddresses({ network: this.activeNetwork, walletId: this.activeWalletId, assets: [this.asset] })
    const uri = [
      this.chainName,
      cryptoassets[this.asset.toLowerCase()].formatAddress(unusedAddress[0]._address)
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
      const copyText = document.querySelector('.receive_address')
      const tempInput = document.createElement('input')
      tempInput.style = 'display: none;'
      tempInput.value = copyText.innerHTML
      document.body.appendChild(tempInput)
      tempInput.select()
      document.execCommand('copy')
      document.body.removeChild(tempInput)
      this.copied = true
      setTimeout(() => { this.copied = false }, 3000)
    }
  }
}
</script>

<style lang="scss">
.receive {
  &_qr {
    margin: 30px auto 0 auto;
    width: 250px;
  }
}
</style>
