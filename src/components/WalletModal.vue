<template>
  <Modal type="modal-sm" @close="$emit('close')">
    <ul class="list-group list-group-flush mt-1 mb-1 text-center">
      <li class="list-group-item h4 mb-0" v-if="!showSendTo">
        <span>{{wallet.toUpperCase()}}</span>

        <div v-if="qrcode" v-html="qrcode" />

        <p class="small font-weight-light mb-4" style="word-break: break-all">{{address}}</p>

        <p class="h5">{{balance}} {{wallet.toUpperCase()}}</p>
      </li>
      <li class="list-group-item text-left" v-else>
        <div class="form-group">
          <label for="address">To Address</label>
          <input type="text" class="form-control form-control-lg simple mb-3" v-model="sendAddress" :readonly="loading" id="address">
        </div>
        <div class="form-group">
          <label for="amount">Amount in {{wallet.toUpperCase()}}</label>
          <input type="number" class="form-control form-control-lg simple" v-model="sendAmount" step="0.0001" :readonly="loading" id="amount">
          <p class="form-text font-weight-normal text-muted mb-3">You have {{balance}} {{wallet.toUpperCase()}}</p>
        </div>
        <button
          :class="{
            'text-center btn btn-lg btn-block': true,
            'btn-light': loading,
            'btn-primary': !loading
          }"
          :disabled="!canSend || loading" @click="sendTransaction">
          <span v-if="!loading">Withdraw</span>
          <Pacman v-else class="d-inline-block mr-3" />
        </button>
      </li>
      <li class="list-group-item font-weight-normal cursor-pointer" @click="showSendTo = !showSendTo">
        <span v-if="!showSendTo">Withdraw &rsaquo;</span>
        <span v-else>&lsaquo; Back</span>
      </li>
      <li class="list-group-item font-weight-normal cursor-pointer" @click="$emit('refresh')">Refresh balance</li>
    </ul>
  </Modal>
</template>

<script>
import cryptoassets from '@liquality/cryptoassets'
import BN from 'bignumber.js'
import QRCode from 'qrcode'

import client from '@/utils/client'
import Modal from '@/components/Modal'
import Pacman from '@/components/Pacman'

export default {
  data () {
    return {
      qrcode: null,
      showSendTo: false,
      sendAmount: 0,
      sendAddress: null,
      loading: false
    }
  },
  components: {
    Modal,
    Pacman
  },
  props: {
    wallet: String,
    address: String,
    balance: [String, Number]
  },
  computed: {
    canSend () {
      if (!this.sendAddress) return false

      const sendAmount = BN(this.sendAmount)

      if (sendAmount.gt(this.balance) || sendAmount.lte(0)) return false

      return true
    }
  },
  created () {
    const uri = [
      // this.wallet.toLowerCase(),
      this.address
    ].join(':')

    QRCode.toString(uri, {
      type: 'svg'
    }, (err, svg) => {
      if (err) throw err

      this.qrcode = svg
    })
  },
  methods: {
    async sendTransaction () {
      this.loading = true

      const amount = cryptoassets[this.wallet].currencyToUnit(this.sendAmount)

      console.log(await client(this.wallet)('chain.sendTransaction')(this.sendAddress, amount, null, this.address))

      this.sendAddress = null
      this.sendAmount = null

      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">
.list-group-flush {
  a {
    margin: 0;
  }

  > a:first-child {
    border-top-left-radius: $border-radius;
    border-top-right-radius: $border-radius;
  }

  > a:last-child {
    border-bottom-left-radius: $border-radius;
    border-bottom-right-radius: $border-radius;
  }
}
</style>
