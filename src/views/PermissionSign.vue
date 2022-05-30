<template>
  <div>
    <div class="popup-logo">
      <img :src="logo" />
    </div>
    <div class="permission-sign wrapper text-center">
      <div class="wrapper_top form">
        <h2>Request to Sign</h2>
        <img :src="getAssetIcon(asset)" class="permission-sign_icon mt-4 mb-2" />
        <p class="permission-sign_address">{{ shortenAddress(address) }}</p>
        <div class="permission-sign_message mt-4">
          <p class="text-left mb-1 font-weight-bold">Message:</p>
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
            Cancel
          </button>
          <button
            class="btn btn-primary btn-lg btn-icon"
            @click.stop="reply(true)"
            :disabled="loading"
          >
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else>Sign</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { getAssetColorStyle } from '@liquality/wallet-core/dist/utils/asset'
import { getAssetIcon } from '@/utils/asset'
import { shortenAddress } from '@liquality/wallet-core/dist/utils/address'
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'
import SpinnerIcon from '@/assets/icons/spinner.svg'

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
    SpinnerIcon
  },
  data() {
    return {
      loading: false,
      replied: false,
      isSignTypedMessage: false,
      messageToDisplay: '',
      messageToSign: ''
    }
  },
  methods: {
    ...mapActions('app', ['replyPermission']),
    getAssetIcon,
    getAssetColorStyle,
    shortenAddress,
    async reply(allowed) {
      if (this.loading) return
      this.loading = true

      try {
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
        this.loading = false
      }
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId']),
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
    }
  },
  created() {
    if (this.request.method === 'wallet.signTypedMessage') {
      const { params } = this.request.args[0]
      const { message } = JSON.parse(params[1])

      this.messageToDisplay = Object.entries(message)

      this.messageToSign = this.request.args[0]
    } else {
      this.messageToDisplay = hexToAscii(this.request.args[0])

      this.messageToSign = hexToAscii(this.request.args[0]) // Handle wallet.signMessage
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
    font-weight: bold;
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
    height: 175px;
    overflow-y: auto;
    font-size: 14px;
    pre {
      white-space: pre-wrap;
      font-family: 'Montserrat', sans-serif;
    }
  }

  .signed-typed-data-message {
    height: 175px;
    overflow-y: auto;

    div {
      text-align: start;

      span {
        &:first-child {
          font-weight: bold;
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
