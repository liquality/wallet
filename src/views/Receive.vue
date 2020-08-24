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
      const address = this.addresses[this.activeNetwork]?.[this.activeWalletId]?.[this.asset]
      return cryptoassets[this.asset.toLowerCase()].formatAddress(address)
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
    await this.getUnusedAddresses({ network: this.activeNetwork, walletId: this.activeWalletId, assets: [this.asset] })
    const uri = [
      this.chainName,
      this.address
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
    async copy () {
      await navigator.clipboard.writeText(this.address)
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
    width: 300px;
  }
  &_address {
    font-size: $font-size-sm;
    color: $color-primary;
  }
}
</style>
