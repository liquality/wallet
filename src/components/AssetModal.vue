<template>
  <Modal type="modal-sm" @close="$emit('close')">
    <ul class="list-group list-group-flush mb-1 text-center">
      <li class="list-group-item h4 mb-0" v-if="!showSendTo">
        <div class="modal-cover">
          <span class="bold-label text-white">{{asset}}</span>

          <div v-if="qrcode" v-html="qrcode" class="mb-2" />

          <p class="small font-weight-light mb-4 word-break-all">{{address}}</p>

          <p class="small font-weight-light mb-0 word-break-all">{{prettyBalance(balance, asset)}} {{asset}}</p>
        </div>
      </li>
      <li class="list-group-item text-left" v-else>
        <div class="form-group">
          <label for="address" class="bold-label text-primary">To Address</label>
          <input type="text" class="form-control form-control-lg simple mb-3" v-model="sendAddress" :readonly="loading" id="address">
        </div>
        <div class="form-group">
          <label for="amount" class="bold-label text-primary">Amount in {{asset}}</label>
          <input type="number" class="form-control form-control-lg simple" v-model="sendAmount" step="0.0001" :readonly="loading" id="amount">
          <p class="form-text font-weight-normal text-muted mb-3">You have {{prettyBalance(balance, asset)}} {{asset}}</p>
        </div>
        <button
          :class="{
            'text-center btn btn-lg btn-block': true,
            'btn-light': loading,
            'btn-primary': !loading
          }"
          :disabled="!canSend || loading" @click="send">
          <span v-if="!loading">Withdraw</span>
          <Pacman v-else class="d-inline-block mr-3" />
        </button>
      </li>
      <li class="list-group-item font-weight-normal cursor-pointer" @click="showSendTo = !showSendTo">
        <span v-if="!showSendTo">Withdraw &rsaquo;</span>
        <span v-else>&lsaquo; Back</span>
      </li>
      <li class="list-group-item font-weight-normal cursor-pointer" @click="refresh">Refresh balance</li>
    </ul>
  </Modal>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import cryptoassets from '@liquality/cryptoassets'
import BN from 'bignumber.js'
import QRCode from 'qrcode'

import { prettyBalance } from '@/utils/coinFormatter'

import Modal from '@/components/Modal.vue'
import Pacman from '@/components/Pacman.vue'

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
    asset: String
  },
  computed: {
    ...mapState(['addresses', 'activeNetwork', 'activeWalletId', 'balances']),
    canSend () {
      if (!this.sendAddress) return false

      const sendAmount = BN(this.sendAmount)

      if (sendAmount.gt(this.balance) || sendAmount.lte(0)) return false

      return true
    },
    address () {
      return this.addresses[this.activeNetwork][this.activeWalletId][this.asset]._address
    },
    balance () {
      return this.balances[this.activeNetwork][this.activeWalletId][this.asset]
    }
  },
  created () {
    const uri = [
      this.asset.toLowerCase(),
      this.address
    ].join(':')

    QRCode.toString(uri, {
      type: 'svg',
      color: {
        dark: '#fff',
        light: '#5665c2'
      }
    }, (err, svg) => {
      if (err) throw err

      this.qrcode = svg
    })
  },
  methods: {
    prettyBalance,
    ...mapActions(['updateBalances', 'sendTransaction']),
    refresh () {
      this.updateBalances({ network: this.activeNetwork, walletId: this.activeWalletId })
      this.$emit('close')
    },
    async send () {
      this.loading = true

      const amount = cryptoassets[this.asset.toLowerCase()].currencyToUnit(this.sendAmount).toNumber()

      await this.sendTransaction({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        asset: this.asset,
        amount,
        to: this.sendAddress,
        from: this.address
      })

      this.sendAddress = null
      this.sendAmount = null

      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">
.list-group-flush {
  .list-group-item:first-child {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }

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
