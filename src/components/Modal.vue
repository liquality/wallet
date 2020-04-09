<template>
  <div>
    <div class="modal-backdrop"></div>
    <div class="modal d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-body p-0" v-if="false">
            <div class="list-group list-group-flush">
              <a class="list-group-item h4 font-weight-light py-4">Refresh balance</a>
              <a class="list-group-item h4 font-weight-light py-4">Withdraw</a>
            </div>
          </div>
          <div class="modal-body">
            <h2 class="h4 mb-3 font-weight-light d-flex justify-content-between align-items-center">
              Sell {{market.from}}
              <span class="cursor-pointer text-muted small" @click="$emit('close')">&times;</span>
            </h2>

            <input type="number" class="form-control form-control-lg simple mb-3" v-model="amount" step="0.0001">

            <p class="mb-2 cursor-pointer" @click="amount = marketMin">
              <span class="badge text-muted">Min</span>
              <span class="font-weight-normal">{{marketMin}} </span>
              <small class="text-muted">{{market.from}}</small>
            </p>

            <p class="mb-2 cursor-pointer" @click="amount = marketMax">
              <span class="badge text-muted">Max</span>
              <span class="font-weight-normal">{{marketMax}} </span>
              <small class="text-muted">{{market.from}}</small>
            </p>

            <p class="mb-2">
              <span class="badge text-muted">Rate</span>
              <small class="text-muted">1 {{market.from}} = </small>
              <span class="font-weight-normal">{{market.rate}} </span>
              <small class="text-muted">{{market.to}}</small>
            </p>

            <p class="mb-2">
              <span class="badge text-muted">You have</span>
              <span class="font-weight-normal">{{fromBalance}} </span>
              <small class="text-muted">{{market.from}}</small>
            </p>

            <p>
              <span class="badge text-muted">You get</span>
              <span class="font-weight-normal">{{youGet}} </span>
              <small class="text-muted">{{market.to}}</small>
            </p>

            <button
              class="text-center btn btn-lg btn-primary btn-block"
              :disabled="!canSell"
              @click="sell">Sell</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import cryptoassets from '@liquality/cryptoassets'
import BN from 'bignumber.js'

export default {
  data () {
    return {
      amount: 0
    }
  },
  props: {
    market: Object,
    balance: Object
  },
  created () {
    this.amount = this.marketMin
  },
  computed: {
    fromBalance () {
      return this.balance[this.market.from.toLowerCase()]
    },
    canSell () {
      const amount = BN(this.amount)

      if (amount.gt(this.marketMax) || amount.lt(this.marketMin) || amount.gt(this.fromBalance)) return false

      return true
    },
    marketMin () {
      return cryptoassets[this.market.from.toLowerCase()].unitToCurrency(this.market.min)
    },
    marketMax () {
      return cryptoassets[this.market.from.toLowerCase()].unitToCurrency(this.market.max)
    },
    youGet () {
      return BN(this.amount).times(this.market.rate).dp(8)
    }
  },
  methods: {
    sell () {
      this.$emit('sell', {
        from: this.market.from,
        to: this.market.to,
        amount: this.amount
      })
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

.small-12 {
  font-size: 12px;
}

input.simple {
  // border-radius: 0!important;
  // border-top: 0;
  // border-left: 0;
  // border-right: 0;
  outline: none;
  box-shadow: none;

  &:hover, &:focus, &:active {
    outline: none;
    box-shadow: none;
  }
}

.modal-backdrop {
  background-color: hsla(0, 0%, 0%, 0.5)!important;
}
</style>
