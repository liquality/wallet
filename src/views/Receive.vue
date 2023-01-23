<template>
  <div class="receive">
    <NavBar
      :showBack="true"
      :backPath="routeSource === 'assets' ? '/wallet' : `/accounts/${account.id}/${asset}`"
      :backLabel="routeSource === 'assets' ? $t('common.overview') : asset"
    >
      {{ $t('common.receive') }} {{ asset }}
    </NavBar>
    <div class="wrapper form text-center">
      <div class="wrapper_top form">
        <div class="form-group">
          <div class="receive_asset">
            <img :src="getAssetIcon(asset)" class="asset-icon" />
          </div>
          <label id="your_current_asset_address">
            {{ $t('pages.receive.yourCurrentAddress', { asset }) }}
          </label>
          <p class="receive_address text-break" id="receive_address">
            {{ address }}
            <CopyIcon
              class="copy-icon"
              @click="copy"
              v-tooltip.bottom="{
                content: copied ? $t('common.copied') : $t('common.clickToCopy'),
                hideOnTargetClick: false
              }"
            />
          </p>
          <p class="receive_message">
            {{ $t('pages.receive.receiveMessage') }}
          </p>
          <div v-if="qrcode" v-html="qrcode" class="receive_qr" id="receive_qr"></div>
          <div class="buy-crypto-container" v-show="activeNetwork === 'mainnet'">
            <div class="mt-2 text-uppercase font-bold">{{ $t('common.or') }}</div>
            <BuyCryptoButton
              :btn-class="['btn-light', 'btn-outline-primary']"
              :asset="asset"
              :chain="chain"
              :address="address"
              :screen="'Receive'"
            />
          </div>
          <div v-if="faucet" class="testnet_message">
            <div>{{ faucet.name }} testnet faucet</div>
            <div id="receive_url">
              <a :href="faucet.url" target="_blank">
                {{ faucet.url }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="wrapper_bottom">
        <div class="button-group">
          <router-link
            :to="routeSource === 'assets' ? '/wallet' : `/accounts/${account.id}/${asset}`"
          >
            <button class="btn btn-light btn-outline-primary btn-lg" id="done_button">
              {{ $t('common.done') }}
            </button>
          </router-link>
          <button class="btn btn-primary btn-lg btn-icon" id="copy_address_button" @click="copy">
            <template v-if="copied">
              <TickIcon />
              {{ $t('common.copied') }}
            </template>
            <template v-else>
              <CopyWhiteIcon class="no-stroke" />
              {{ $t('common.copyAddress') }}
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
import BuyCryptoButton from '@/components/BuyCrypto/BuyCryptoButton'
import CopyIcon from '@/assets/icons/copy.svg'
import CopyWhiteIcon from '@/assets/icons/copy_white.svg'
import TickIcon from '@/assets/icons/tick.svg'
import { ChainId, getChain, isEvmChain } from '@liquality/cryptoassets'
import cryptoassets from '@liquality/wallet-core/dist/src/utils/cryptoassets'
import { version as walletVersion } from '../../package.json'

export default {
  components: {
    NavBar,
    CopyIcon,
    CopyWhiteIcon,
    TickIcon,
    BuyCryptoButton
  },
  data() {
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
    ...mapGetters(['accountItem']),
    account() {
      return this.accountItem(this.accountId)
    },
    routeSource() {
      return this.$route.query.source || null
    },
    chain() {
      return cryptoassets[this.asset]?.chain
    },
    chainName() {
      const isEvm = isEvmChain(this.activeNetwork, this.chain)

      if (isEvm) {
        return 'ethereum'
      } else {
        return {
          bitcoin: 'bitcoin',
          near: 'near',
          solana: 'solana',
          terra: 'terra'
        }[this.chain]
      }
    },
    faucet() {
      const asset = cryptoassets[this.asset]
      const chain = getChain(this.activeNetwork, asset?.chain)

      if (chain.faucetUrl) {
        return {
          name: chain.name,
          url: chain.faucetUrl
        }
      }
      return null
    }
  },
  async created() {
    if (
      this.account &&
      this.account?.type.includes('ledger') &&
      this.account?.chain !== ChainId.Bitcoin
    ) {
      getChain(this.activeNetwork, cryptoassets[this.asset]?.chain)?.formatAddressUI(
        this.account.addresses[0]
      )
    } else {
      const addresses = await this.getUnusedAddresses({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        assets: [this.asset],
        accountId: this.accountId
      })
      this.address = getChain(this.activeNetwork, this.chain)?.formatAddressUI(addresses[0])
    }

    const uri = this.chainName === 'terra' ? this.address : [this.chainName, this.address].join(':')
    QRCode.toString(
      uri,
      {
        type: 'svg',
        margin: 0
      },
      (err, svg) => {
        if (err) throw err

        this.qrcode = svg
      }
    )
  },
  methods: {
    ...mapActions('app', ['trackAnalytics']),
    ...mapActions(['getUnusedAddresses']),
    getAssetIcon,
    async copy() {
      this.trackAnalytics({
        event: `User on ${this.asset} Receive Page`,
        properties: {
          walletVersion,
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
          walletVersion,
          category: 'Send/Receive',
          action: 'User copied address',
          asset: `${this.asset}`,
          chainName: `${cryptoassets[this.asset]?.chain}`
        }
      })
      setTimeout(() => {
        this.copied = false
      }, 3000)
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
    font-weight: 600;
    margin-top: 26px;
  }

  &_qr {
    margin: 17px auto 0 auto;
    width: 120px;
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

  .buy-crypto-container {
    display: inline-flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.1em;

    .btn {
      max-width: 120px;
    }
  }
}
</style>
