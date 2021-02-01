<template>
  <div class="receive">
    <NavBar showBack="true"
            :backPath="routeSource === 'assets' ? '/wallet' : `/account/${asset}`"
            :backLabel="routeSource === 'assets' ? 'Overview' : asset">
      Receive {{asset}}
    </NavBar>
    <div class="wrapper form text-center">
      <div class="wrapper_top form">
        <div class="form-group">
          <div class="receive_asset"><img :src="getAssetIcon(asset)" class="asset-icon" /></div>
          <label>Your Current {{asset}} Address</label>
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
          <div v-if="faucet" class="testnet_message">
            <div>{{ faucet.name }} testnet faucet</div>
            <div>
              <a :href="faucet.url"
                 target="_blank">
                 {{ faucet.url }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="wrapper_bottom">
        <div class="button-group">
          <router-link :to="routeSource === 'assets' ? '/wallet' : `/account/${asset}`">
            <button class="btn btn-light btn-outline-primary btn-lg">
              Done
            </button>
          </router-link>
          <button class="btn btn-primary btn-lg btn-icon" @click="copy">
            <template v-if="copied"><TickIcon /> Copied!</template>
            <template v-else><CopyWhiteIcon class="no-stroke"/> Copy Address</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import QRCode from 'qrcode'
import {
  getAssetIcon,
  getChainFromAsset
} from '@/utils/asset'
import NavBar from '@/components/NavBar'
import CopyIcon from '@/assets/icons/copy.svg'
import CopyWhiteIcon from '@/assets/icons/copy_white.svg'
import TickIcon from '@/assets/icons/tick.svg'
import cryptoassets from '@/utils/cryptoassets'

export default {
  components: {
    NavBar,
    CopyIcon,
    CopyWhiteIcon,
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
    routeSource () {
      return this.$route.query.source || null
    },
    address () {
      const address = this.addresses[this.activeNetwork]?.[this.activeWalletId]?.[this.asset]
      return address && cryptoassets[this.asset].formatAddress(address)
    },
    chainName () {
      const assetChain = getChainFromAsset(this.asset)
      return ({
        BTC: 'bitcoin',
        ETH: 'ethereum',
        RBTC: 'ethereum'
      })[assetChain]
    },
    faucet () {
      if (this.activeNetwork === 'testnet') {
        return ({
          BTC: { name: 'Bitcoin', url: 'https://testnet-faucet.mempool.co/' },
          ETH: { name: 'Ether', url: 'https://faucet.rinkeby.io/' },
          RBTC: { name: 'RBTC/RSK', url: 'https://faucet.rsk.co/' }
        })[this.asset]
      }
      return null
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
    font-size: $font-size-xs;
    font-weight: lighter;
  }

  .testnet_message {
    margin-top: 24px;
    font-size: $font-size-tiny;
    font-weight: lighter;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
}
</style>
