<template>
  <div>
    <div class="popup-logo">
      <img :src="logo" />
    </div>
    <div class="permission-sign wrapper text-center">
      <div class="wrapper_top form">
        <h2>Request to Sign</h2>
        <img :src="getAssetIcon(asset)" class="permission-sign_icon mt-4 mb-2" />
        <p class="permission-sign_address">{{shortenAddress(address)}}</p>
        <div class="permission-sign_message mt-4">
          <p class="text-left mb-1">Message:</p>
          <textarea v-model="message" readonly></textarea>
        </div>
      </div>

      <div class="wrapper_bottom">
        <div class="button-group">
          <button class="btn btn-light btn-outline-primary btn-lg" @click="reply(false)">Cancel</button>
          <button class="btn btn-primary btn-lg btn-icon" @click.stop="reply(true)" :disabled="loading">
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
import { getAssetColorStyle, getAssetIcon } from '@/utils/asset'
import { shortenAddress } from '@/utils/address'
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'
import SpinnerIcon from '@/assets/icons/spinner.svg'

function isHex (str) {
  return Boolean(str.match(/^[0-9a-f]+$/i))
}

function hexToAscii (hex) {
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
  data () {
    return {
      loading: false,
      replied: false
    }
  },
  methods: {
    ...mapActions(['replyPermission']),
    getAssetIcon,
    getAssetColorStyle,
    shortenAddress,
    async reply (allowed) {
      if (this.loading) return
      this.loading = true

      try {
        await this.replyPermission({
          request: {
            ...this.request,
            args: [this.message, this.request.args[1]]
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
    logo () {
      return LogoWallet
    },
    asset () {
      return this.request.asset
    },
    address () {
      return this.request.args[1]
    },
    message () {
      return hexToAscii(this.request.args[0])
    },
    request () {
      return {
        ...this.$route.query,
        args: JSON.parse(this.$route.query.args)
      }
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
}
</style>
