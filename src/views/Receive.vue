<template>
  <div class="receive">
    <NavBar showBack="true" :backPath="`/account/${asset}`" :backLabel="asset">
      Receive {{asset}}
    </NavBar>
    <div class="wrapper form text-center">
      <div class="wrapper_top form">
        <div class="form-group">
          <div class="receive_asset"><img :src="getAssetIcon(asset)" class="asset-icon" /></div>
          <label>Your Current {{addressType}} Address</label>
          <p class="receive_address">{{address}}
            <CopyIcon
                  class="copy-icon"
                  @click="copy"
                  v-tooltip.bottom="{
                    content: copied ? 'Copied!' : 'Copy',
                    hideOnTargetClick: false,
                  }"
                />
          </p>
          <p class="receive_message">Scan this QR code with a mobile wallet to send funds to this address.</p>
          <div v-if="qrcode" v-html="qrcode" class="receive_qr"></div>
        </div>
      </div>

      <div class="wrapper_bottom">
        <div class="button-group">
          <router-link :to="`/account/${asset}`"><button class="btn btn-light btn-outline-primary btn-lg">Done</button></router-link>
          <button class="btn btn-primary btn-lg btn-icon" @click="copy">
            <template v-if="copied"><TickIcon /> Copied!</template>
            <template v-else><CopyIcon /> Copy Address</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import QRCode from 'qrcode'
import { getAssetIcon } from '@/utils/asset'
import NavBar from '@/components/NavBar'
import CopyIcon from '@/assets/icons/copy.svg'
import TickIcon from '@/assets/icons/tick.svg'
import cryptoassets from '@/utils/cryptoassets'

export default {
  components: {
    NavBar,
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
      return address && cryptoassets[this.asset].formatAddress(address)
    },
    chainName () {
      return ({
        BTC: 'bitcoin',
        ETH: 'ethereum',
        RBTC: 'ethereum'
      })[this.asset]
    },
    addressType () {
      return ({
        BTC: 'bitcoin',
        ETH: 'ethereum',
        RBTC: 'RSK'
      })[this.asset]
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
    getAssetIcon,
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
  &_asset {
    padding-bottom: 6px;
  }
  &_message {
    font-weight: bold;
    margin-top: 40px;
  }
  &_qr {
    margin: 30px auto 0 auto;
    width: 196px;
  }
  &_address {
    font-size: $font-size-tiny;
    font-weight: lighter;
  }
}
</style>
