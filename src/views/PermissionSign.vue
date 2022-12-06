<template>
  <div>
    <div class="popup-logo">
      <img :src="logo" />
    </div>
    <div class="permission-sign wrapper text-center">
      <LedgerSignRequestModal :open="signRequestModalOpen" @close="closeSignRequestModal" />
      <div class="wrapper_top form">
        <h2>{{ $t('pages.permission.requestToSign') }}</h2>
        <img :src="getAssetIcon(asset)" class="permission-sign_icon mt-4 mb-2" />
        <p class="permission-sign_address">{{ shortenAddress(address) }}</p>
        <div class="permission-sign_message mt-4">
          <p class="text-left mb-1 font-bold">{{ $t('common.message') }}:</p>
          <div class="legacy-message" v-if="typeof messageToDisplay === 'string'">
            <pre>{{ messageToDisplay }}</pre>
          </div>

          <div class="signed-typed-data-message" v-else>
            <div v-for="[key, value] in messageToDisplay" :key="key">
              <span>[{{ key }}]</span>
              <div>{{ value }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="wrapper_bottom">
        <div class="button-group">
          <button class="btn btn-light btn-outline-primary btn-lg" @click="reply(false)">
            {{ $t('common.cancel') }}
          </button>
          <button
            class="btn btn-primary btn-lg btn-icon"
            @click.stop="reply(true)"
            :disabled="loading"
          >
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else>{{ $t('common.sign') }}</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { getAssetColorStyle } from '@liquality/wallet-core/dist/src/utils/asset'
import { getAssetIcon } from '@/utils/asset'
import { shortenAddress } from '@liquality/wallet-core/dist/src/utils/address'
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { isAddress } from 'ethers/lib/utils'
import LedgerSignRequestModal from '@/components/LedgerSignRequestModal'
import { ledgerConnectMixin } from '@/utils/hardware-wallet'
import {
  createInternalError,
  CUSTOM_ERRORS
} from '@liquality/error-parser/dist/src/LiqualityErrors'

const signTypedDataMethodToVersion = {
  eth_signTypedData: 'V1',
  eth_signTypedData_v3: 'V3',
  eth_signTypedData_v4: 'V4'
}

function isHex(str) {
  return Boolean(str.match(/^[0-9a-f]+$/i))
}

function hexToAscii(hex) {
  hex = hex.replace('0x', '')
  if (!isHex(hex)) return hex

  let str = ''
  for (let i = 0; i < hex.length; i += 2) {
    var code = parseInt(hex.substr(i, 2), 16)
    str += String.fromCharCode(code)
  }
  return str
}

export default {
  components: {
    SpinnerIcon,
    LedgerSignRequestModal
  },
  mixins: [ledgerConnectMixin],
  data() {
    return {
      loading: false,
      replied: false,
      messageToDisplay: '',
      messageToSign: '',
      signRequestModalOpen: false
    }
  },
  methods: {
    ...mapActions('app', ['replyPermission']),
    getAssetIcon,
    getAssetColorStyle,
    shortenAddress,
    closeSignRequestModal() {
      this.signRequestModalOpen = false
      this.loading = false
    },
    async reply(allowed) {
      if (this.loading) {
        return
      }
      this.loading = true

      try {
        if (this.account?.type.includes('ledger')) {
          this.signRequestModalOpen = true
          await this.connectLedger()
        }
        await this.replyPermission({
          request: {
            ...this.request,
            args: [this.messageToSign, this.request.args[1]]
          },
          allowed
        })
        this.replied = true
        window.close()
      } finally {
        this.signRequestModalOpen = false
        this.loading = false
      }
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId']),
    ...mapGetters(['accountItem']),
    logo() {
      return LogoWallet
    },
    asset() {
      return this.request.asset
    },
    address() {
      return this.request.args[1] || this.request.args[0].params[0]
    },
    request() {
      return {
        ...this.$route.query,
        args: JSON.parse(this.$route.query.args)
      }
    },
    account() {
      return this.accountItem(this.request?.accountId)
    }
  },
  created() {
    if (this.request.method === 'wallet.signTypedData') {
      const { method, params } = this.request.args[0]

      const first = params[0]
      const second = params[1]
      const msgParams = { version: signTypedDataMethodToVersion[method] }
      const extra = params[2] || {}
      try {
        if (isAddress(first)) {
          msgParams.from = first
          msgParams.data = JSON.parse(second)
        } else {
          msgParams.from = second
          msgParams.data = JSON.parse(first)
        }
      } catch (err) {
        throw createInternalError(CUSTOM_ERRORS.Invalid.Json(err)) // Error(`Invalid JSON: ${err}`)
      }

      this.messageToDisplay = Object.entries(msgParams.data)
      this.messageToSign = { ...msgParams, ...extra }
    }
    // Handle wallet.signMessage
    else {
      this.messageToDisplay = hexToAscii(this.request.args[0])
      this.messageToSign = hexToAscii(this.request.args[0])
    }
  }
}
</script>

<style lang="scss">
.permission-sign {
  &_icon {
    width: 40px;
    height: 40px;
  }

  &_address {
    font-weight: 600;
  }

  &_message {
    textarea {
      width: 100%;
      height: 120px;
      resize: none;
    }
  }

  .legacy-message {
    text-align: start;
    height: 176px;
    overflow-y: auto;
    font-size: 14px;
    pre {
      white-space: pre-wrap;
      font-family: 'Montserrat', sans-serif;
    }
  }

  .signed-typed-data-message {
    height: 176px;
    overflow-y: auto;

    div {
      text-align: start;

      span {
        &:first-child {
          font-weight: 600;
          margin-right: 5px;
        }
      }

      div {
        overflow-wrap: break-word;
      }
    }
  }
}
</style>
