<template>
  <Modal @close="$emit('close')">
    <div class="modal-body">
      <h2 class="h4 mb-3 font-weight-light">
        Buy {{market.to}}
      </h2>

      <input type="number" class="form-control form-control-lg simple mb-3" v-model="amount" step="0.0001" :readonly="loading">

      <p class="mb-2 cursor-pointer" @click="setAmount(reverseMin)">
        <span class="badge text-muted">Min</span>
        <span class="font-weight-normal">{{reverseMin}} </span>
        <small class="text-muted">{{market.to}}</small>
      </p>

      <p class="mb-2 cursor-pointer" @click="setAmount(reverseMax)">
        <span class="badge text-muted">Max</span>
        <span class="font-weight-normal">{{reverseMax}} </span>
        <small class="text-muted">{{market.to}}</small>
      </p>

      <p class="mb-2">
        <span class="badge text-muted">Rate</span>
        <small class="text-muted">1 {{market.to}} = </small>
        <span class="font-weight-normal">{{reverseRate}} </span>
        <small class="text-muted">{{market.from}}</small>
      </p>

      <p class="mb-2">
        <span class="badge text-muted">You have</span>
        <span class="font-weight-normal">{{fromBalance}} </span>
        <small class="text-muted">{{market.from}}</small>
      </p>

      <p>
        <span class="badge text-muted">You pay</span>
        <span class="font-weight-normal">{{youPay}} </span>
        <small class="text-muted">{{market.from}}</small>
      </p>

      <button
        :class="{
          'text-center btn btn-lg btn-block': true,
          'btn-light': loading,
          'btn-primary': !loading
        }"
        :disabled="!canBuy || loading"
        @click="buy">
        <span v-if="!loading">Buy</span>
        <Pacman v-else class="d-inline-block mr-3" />
      </button>
    </div>
  </Modal>
</template>

<script>
import cryptoassets from '@liquality/cryptoassets'
import BN from 'bignumber.js'

import Pacman from '@/components/Pacman'
import Modal from '@/components/Modal'

export default {
  components: {
    Modal,
    Pacman
  },
  data () {
    return {
      amount: 0,
      loading: false
    }
  },
  props: {
    market: Object,
    balance: Object
  },
  created () {
    this.amount = this.reverseMin
  },
  computed: {
    fromBalance () {
      return this.balance[this.market.from.toLowerCase()]
    },
    canBuy () {
      const amount = BN(this.amount)
      const youPay = BN(this.youPay)

      if (amount.gt(this.reverseMax) || amount.lt(this.reverseMin) || youPay.gt(this.fromBalance)) return false

      return true
    },
    marketMin () {
      return cryptoassets[this.market.from.toLowerCase()].unitToCurrency(this.market.min)
    },
    marketMax () {
      return cryptoassets[this.market.from.toLowerCase()].unitToCurrency(this.market.max)
    },
    youPay () {
      return BN(this.amount).div(this.market.rate).dp(8)
    },
    reverseRate () {
      return BN(1).div(this.market.rate).dp(8)
    },
    reverseMin () {
      return BN(this.marketMin).times(this.market.rate).dp(8)
    },
    reverseMax () {
      return BN(this.marketMax).times(this.market.rate).dp(8)
    }
  },
  methods: {
    buy () {
      this.loading = true

      this.$emit('buy', {
        from: this.market.from,
        to: this.market.to,
        amount: this.youPay
      })
    },
    setAmount (amount) {
      if (this.loading) return

      this.amount = amount
    }
  }
}
</script>

<style lang="scss">
input.simple {
  // border-radius: 0!important;
  // border-top: 0;
  font-size: 1.4rem!important;
  // border-left: 0;
  // padding-left: 8px!important;
  // border-right: 0;
  font-weight: 400;
  outline: none;
  box-shadow: none;

  &:hover, &:focus, &:active {
    outline: none;
    box-shadow: none;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }

  &[type="number"]::-webkit-inner-spin-button,
  &[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
</style>
