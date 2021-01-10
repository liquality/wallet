<template>
  <div>
    <div class="popup-logo">
      <img :src="logo" />
    </div>
    <div class="permission-screen wrapper text-center">
      <div class="wrapper_top">
        <h2>Sign Transaction</h2>
        <p class="text-muted">{{$route.query.origin}}</p>
        <img :src="getAssetIcon(asset)" class="permission-screen_icon mb-2" />
        <div class="permission-screen_tx">
          <h5>Outputs</h5>
          <div v-for="(output, i) in outputs" :key="i" class="permission-screen_tx_output bg-light p-2 mb-2 border rounded">
            <div>{{ output.address }}</div>
            <div class="text-primary">{{ prettyBalance(output.value, asset) }} {{ asset }}</div>
          </div>
          <div class="text-muted">Fee: {{ prettyBalance(fee, asset) }} {{ asset }}</div>
        </div>
      </div>

      <div class="wrapper_bottom">
        <div class="button-group">
          <button class="btn btn-light btn-outline-primary btn-lg" @click="reply(false)">Cancel</button>
          <button class="btn btn-primary btn-lg btn-icon" @click="reply(true)" :disabled="loading">
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else>Sign</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import * as bitcoinjs from 'bitcoinjs-lib'
import { getAssetIcon } from '@/utils/asset'
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { AssetNetworks } from '@/store/factory/client'
import { prettyBalance } from '@/utils/coinFormatter'

export default {
  components: {
    SpinnerIcon
  },
  data () {
    return {
      changeAddresses: [],
      loading: false,
      replied: false
    }
  },
  methods: {
    ...mapActions(['replyPermission']),
    prettyBalance,
    getAssetIcon,
    reply (allowed) {
      this.loading = true

      try {
        this.replyPermission({
          request: this.request,
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
    ...mapGetters(['client']),
    ...mapState(['activeNetwork', 'activeWalletId']),
    logo () {
      return LogoWallet
    },
    asset () {
      return this.request.asset
    },
    psbtBase64 () {
      return this.request.args[0]
    },
    inputIndex () {
      return this.request.args[1]
    },
    inputsValue () {
      return this.psbt.data.inputs.reduce((total, vin) => total + vin.witnessUtxo.value, 0)
    },
    inputAddress () {
      return this.request.args[2]
    },
    psbt () {
      return bitcoinjs.Psbt.fromBase64(this.psbtBase64, { network: AssetNetworks.BTC[this.activeNetwork] })
    },
    outputs () {
      console.log(this.changeAddresses)
      return this.psbt.txOutputs.filter(vout => !this.changeAddresses.includes(vout.address))
    },
    outputsValue () {
      return this.psbt.txOutputs.reduce((total, vout) => total + vout.value, 0)
    },
    fee () {
      return this.inputsValue - this.outputsValue
    },
    request () {
      return {
        ...this.$route.query,
        args: JSON.parse(this.$route.query.args)
      }
    },
    method () {
      return this.request.method
    }
  },
  async created () {
    const client = this.client(this.activeNetwork, this.activeWalletId, this.asset)
    window.setImmediate = (callback) => { callback() } // setImmediate not availalbe here
    this.changeAddresses = (await client.wallet.getAddresses(0, 100, true)).map(a => a.address)
  },
  beforeDestroy () {
    if (this.replied) return

    this.reply(false)
  }
}
</script>

<style lang="scss">
.permission-screen {
  &_icon {
    width: 40px;
    height: 40px;
  }

  &_tx {
    text-align: left;
  }
}
</style>
