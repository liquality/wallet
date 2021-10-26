<template>
  <div class="permission-screen">
    <div class="popup-logo">
      <img :src="logo" />
    </div>
    <div class="wrapper text-center">
      <div class="wrapper_top">
        <h2>Sign Transaction</h2>
        <p class="text-muted">{{$route.query.origin}}</p>
        <img :src="getAssetIcon(asset)" class="permission-screen_icon mb-2" />
        <div class="permission-screen_tx">
          <h5>Outputs <SpinnerIcon v-if="scanningChangeOutput" class="ml-1" /></h5>
          <div v-if="!scanningChangeOutput">
            <div v-for="(output, i) in outputs" :key="i" class="permission-screen_tx_output bg-light p-2 mb-2 border rounded">
              <div>{{ output.address }}</div>
              <div class="row">
                <div class="col text-primary align-text-bottom">{{ prettyBalance(output.value, asset, 8) }} {{ asset }}</div>
                <div class="col text-right"><span class="badge badge-primary" v-if="externalAddresses.includes(output.address)">My Wallet</span></div>
              </div>
            </div>
            <div class="text-muted">Fee: {{ prettyBalance(fee, asset, 8) }} {{ asset }}</div>
          </div>
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
import 'setimmediate'
import { mapActions, mapState, mapGetters } from 'vuex'
import { Psbt } from 'bitcoinjs-lib'
import { getAssetIcon } from '@/utils/asset'
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import { ChainNetworks } from '@/utils/networks'
import { prettyBalance } from '@/utils/coinFormatter'

export default {
  components: {
    SpinnerIcon
  },
  data () {
    return {
      externalAddresses: [],
      scanningChangeOutput: true,
      changeOutputIndex: -1,
      loading: false,
      replied: false
    }
  },
  methods: {
    ...mapActions(['replyPermission']),
    prettyBalance,
    getAssetIcon,
    async reply (allowed) {
      if (this.loading) return
      this.loading = true

      try {
        await this.replyPermission({
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
    accountId () {
      return this.request.accountId
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
      return Psbt.fromBase64(this.psbtBase64, { network: ChainNetworks.bitcoin[this.activeNetwork] })
    },
    outputs () {
      return this.psbt.txOutputs.filter((output, i) => i !== this.changeOutputIndex)
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
    const client = this.client({
      network: this.activeNetwork, walletId: this.activeWalletId, asset: this.asset, accountId: this.accountId
    })

    const maxAddresses = 500
    const addressesPerCall = 50
    let i = 0
    while (i < maxAddresses) {
      const changeAddresses = (await client.wallet.getAddresses(i, addressesPerCall, true)).map(a => a.address)
      this.changeOutputIndex = this.psbt.txOutputs.findIndex(vout => changeAddresses.includes(vout.address))
      if (this.changeOutputIndex) break
      i += addressesPerCall
    }
    this.scanningChangeOutput = false

    this.externalAddresses = (await client.wallet.getAddresses(0, maxAddresses, false)).map(a => a.address)
  }
}
</script>

<style lang="scss">
.permission-screen {
  padding-bottom: 90px;
  overflow-y: auto;
  height: 100%;

  &_icon {
    width: 40px;
    height: 40px;
  }

  &_tx {
    text-align: left;

    svg {
      height: 16px;
      circle {
        stroke: #dedede;
      }
    }
  }
}
</style>
