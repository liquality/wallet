<template>
  <div class="receive">
    <NavBar
        showBack="true"
        :backPath="routeSource === 'assets' ? '/wallet' : `/accounts/${account.id}/${asset}`"
        :backLabel="routeSource === 'assets' ? 'Overview' : asset">
      Receive {{ asset }}
    </NavBar>
    <div class="wrapper form text-center">
      <div class="wrapper_top form">
        <div class="form-group">
          <div class="receive_asset"><img :src="getAssetIcon(asset)" class="asset-icon"/></div>
          <label id="your_current_asset_address">Your Current {{ asset }} Address</label>
          <p class="receive_address" id="receive_address">{{ address }}
            <CopyIcon
                class="copy-icon"
                @click="copy"
                v-tooltip.bottom="{
                    content: copied ? 'Copied!' : 'Click to copy',
                    hideOnTargetClick: false,
                  }"
            />
          </p>
          <p class="receive_message">Scan this QR code with a mobile wallet to send funds to this address.</p>
          <div v-if="qrcode" v-html="qrcode" class="receive_qr" id="receive_qr"></div>
          <div v-if="faucet" class="testnet_message">
            <div>{{ faucet.name }} testnet faucet</div>
            <div id="receive_url">
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
          <router-link :to="routeSource === 'assets' ? '/wallet' : `/accounts/${account.id}/${asset}`">
            <button class="btn btn-light btn-outline-primary btn-lg" id="done_button">
              Done
            </button>
          </router-link>
          <button class="btn btn-primary btn-lg btn-icon" id="copy_address_button" @click="copy">
            <template v-if="copied">
              <TickIcon/>
              Copied!
            </template>
            <template v-else>
              <CopyWhiteIcon class="no-stroke"/>
              Copy Address
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import QRCode from 'qrcode'
import { getAssetIcon } from '@/utils/asset'
import NavBar from '@/components/NavBar'
import CopyIcon from '@/assets/icons/copy.svg'
import CopyWhiteIcon from '@/assets/icons/copy_white.svg'
import TickIcon from '@/assets/icons/tick.svg'
import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'

export default {
  components: {
    NavBar,
    CopyIcon,
    CopyWhiteIcon,
    TickIcon
  },
  data () {
    return {
      address: null,
      qrcode: null,
      copied: false
    }
  },
  props: {
    asset: String,
    accountId: String
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId']),
    ...mapGetters([
      'accountItem'
    ]),
    account () {
      return this.accountItem(this.accountId)
    },
    routeSource () {
      return this.$route.query.source || null
    },
    chainName () {
      return ({
        bitcoin: 'bitcoin',
        ethereum: 'ethereum',
        near: 'near',
        solana: 'solana',
        rsk: 'ethereum',
        bsc: 'ethereum',
        polyon: 'ethereum',
        terra: 'terra'
      })[cryptoassets[this.asset].chain]
    },
    faucet () {
      if (this.activeNetwork === 'testnet') {
        return ({
          BTC: {
            name: 'Bitcoin',
            url: 'https://testnet-faucet.mempool.co/'
          },
          ETH: {
            name: 'Ethererum Ropsten',
            url: 'https://faucet.dimensions.network/'
          },
          RBTC: {
            name: 'RBTC/RSK',
            url: 'https://faucet.rsk.co/'
          },
          BNB: {
            name: 'BNB',
            url: 'https://testnet.binance.org/faucet-smart/'
          },
          NEAR: {
            name: 'NEAR',
            url: ''
          },
          SOL: {
            name: 'SOLANA',
            url: 'https://solfaucet.com/'
          },
          MATIC: {
            name: 'MATIC',
            url: 'https://faucet.matic.network/'
          },
          ARBETH: {
            name: 'ARBETH',
            url: 'https://faucet.rinkeby.io/'
          },
          LUNA: {
            name: 'TERRA',
            url: 'https://faucet.terra.money/'
          }
        })[this.asset]
      }
      return null
    }
  },
  async created () {
    if (this.account && this.account.type.includes('ledger')) {
      this.address = chains[cryptoassets[this.asset]?.chain]?.formatAddress(this.account.addresses[0], this.activeNetwork)
    } else {
      const addresses = await this.getUnusedAddresses({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        assets: [this.asset],
        accountId: this.accountId
      })
      const chainId = cryptoassets[this.asset]?.chain
      this.address = chains[chainId]?.formatAddress(addresses[0], this.activeNetwork)
    }

    const uri = this.chainName === 'terra' ? this.address : [this.chainName, this.address].join(':')

    QRCode.toString(uri, {
      type: 'svg',
      margin: 0
    }, (err, svg) => {
      if (err) throw err

      this.qrcode = svg
    })
  },
  methods: {
    ...mapActions(['getUnusedAddresses', 'trackAnalytics']),
    getAssetIcon,
    async copy () {
      this.trackAnalytics({
        event: 'Receive screen',
        properties: {
          category: 'Send/Receive',
          action: 'User on Receive screen',
          label: `${this.asset}`
        }
      })
      await navigator.clipboard.writeText(this.address)
      this.copied = true
      this.trackAnalytics({
        event: 'Receive copy address',
        properties: {
          category: 'Send/Receive',
          action: 'User copied address',
          label: `${this.asset} (${this.chainName}) address ${this.address}`
        }
      })
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
    margin-top: 26px;
  }

  &_qr {
    margin: 25px auto 0 auto;
    width: 196px;
  }

  &_address {
    font-size: 0.7rem;
  }

  .testnet_message {
    margin-top: 18px;
    font-size: $font-size-tiny;
    font-weight: lighter;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
}
</style>
