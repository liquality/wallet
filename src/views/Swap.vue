<template>
  <div class="swap wrapper">
    <div class="wrapper_top form">
      <div class="text-center"><small class="text-danger" v-if="ethRequired">An ETH balance is required to swap.</small></div>
      <div class="form-group">
        <label for="amount">Send</label>
        <div class="input-group swap_asset">
          <img :src="'./img/' + asset.toLowerCase() +'.png'" class="swap_asset_icon" />
          <div class="input-group-append">
            <span class="input-group-text">{{asset}}</span>
          </div>
          <input type="number" class="form-control" id="amount" v-model="amount" placeholder="0.00" :style="getAssetColor(asset)">
        </div>
        <small class="form-text d-flex justify-content-between">
          <div class="swap_limits">
            <a href="javascript:void(0)" @click="setAmount(min)">Min</a> {{min}} <a href="javascript:void(0)" class="ml-1" @click="setAmount(max)">Max</a> {{max}}
          </div>
          <div class="text-right">
            <span class="text-muted">Balance&nbsp;</span>
            <span>{{balance}} {{asset}}</span>
          </div>
        </small>
      </div>
      <div class="form-group">
        <label for="amount">Receive</label>
        <div class="input-group swap_asset">
          <img :src="'./img/' + toAsset.toLowerCase() +'.png'" class="swap_asset_icon" />
          <div class="input-group-append">
            <span class="input-group-text">
              <select class="custom-select" @change="setToAsset($event.target.value)" v-model="toAsset">
                <option v-for="to in toAssets" :key="to">{{to}}</option>
              </select>
            </span>
          </div>
          <input type="number" class="form-control" id="amount" readonly v-model="toAmount" placeholder="0.00" :style="getAssetColor(toAsset)">
        </div>
        <small class="form-text d-flex justify-content-between" v-if="!enterSendToAddress">
          <div class="swap_limits">
            <a href="javascript:void(0)" @click="enterSendToAddress = true">+ Receive at external address</a>
          </div>
        </small>
      </div>
      <div class="form-group" v-if="enterSendToAddress">
        <label class="w-100" for="amount">Receive at <a href="javascript:void(0)" class="text-muted float-right" @click="enterSendToAddress = false; sendTo = null">X</a></label>
        <div class="input-group">
          <div class="input-group">
            <input type="text" v-model="sendTo" class="form-control form-control-sm" id="to" placeholder="External Receiving Address" autocomplete="off">
          </div>
        </div>
      </div>

      <div class="swap_rate form-group">
        <label>Rate</label>
        <p><span class="swap-rate_base">1 {{asset}} =</span><span class="swap-rate_value">&nbsp;{{bestRateBasedOnAmount}}</span><span class="swap-rate_term">&nbsp;{{toAsset}}</span></p>
      </div>

      <div class="form-group swap_fees">
        <label>Network Speed/Fee</label>
        <div class="swap_fees_asset" v-for="asset in new Set([getChainFromAsset(asset), getChainFromAsset(toAsset)]) " :key="asset">
          {{ asset }}
          <div class="btn-group btn-group-toggle" data-toggle="buttons">
            <label class="btn btn-light btn-outline-primary btn-sm"
              :class="name == fees[asset].selected ? 'active' : ''"
              v-for="(fee, name) in fees[asset].values" :key="name"
              v-tooltip="{content: `${fee.fee} ${getFeeLabelFromAsset(asset)}<br />${fee.wait}s`}"
              v-on:click="fees[asset].selected = name">
              <input type="radio" name="fee" autocomplete="off" :checked="name == fees[asset].selected "> {{name}}
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="wrapper_bottom">
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="$router.go(-1)">Cancel</button>
        <button class="btn btn-primary btn-lg" @click="swap" :disabled="!bestMarketBasedOnAmount || !canSwap">Review Terms</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import BN from 'bignumber.js'
import { dpUI, prettyBalance } from '@/utils/coinFormatter'
import { getChainFromAsset } from '@/utils/asset'
import cryptoassets from '@liquality/cryptoassets'

export default {
  data () {
    return {
      amount: 0,
      toAsset: null,
      enterSendToAddress: false,
      sendTo: null,
      fees: {}
    }
  },
  props: {
    asset: String
  },
  created () {
    this.toAsset = Object.keys(this.selectedMarket)[0]
    this.amount = this.min
    this.updateMarketData({ network: this.activeNetwork })
    this.updateFees(this.asset)
    this.updateFees(this.toAsset)
  },
  computed: {
    ...mapState(['activeNetwork', 'marketData', 'balances', 'activeWalletId']),
    networkMarketData () {
      return this.marketData[this.activeNetwork]
    },
    networkWalletBalances () {
      return this.balances[this.activeNetwork][this.activeWalletId]
    },
    toAssets () {
      return Object.keys(this.selectedMarket)
    },
    bestAgent () {
      return this.bestMarketBasedOnAmount.agent
    },
    bestRateBasedOnAmount () {
      return this.bestMarketBasedOnAmount.sellRate
    },
    bestMarketBasedOnAmount () {
      return this.market.markets.find(market => {
        const amount = BN(this.amount)
        return BN(market.sellMin).lte(amount) && BN(market.sellMax).gte(amount)
      })
    },
    min () {
      return dpUI(BN(this.market.sellMin), this.asset)
    },
    max () {
      return dpUI(BN(this.market.sellMax), this.asset, true)
    },
    safeAmount () {
      return this.amount || 0
    },
    market () {
      return this.selectedMarket[this.toAsset]
    },
    balance () {
      return prettyBalance(this.networkWalletBalances[this.asset], this.asset)
    },
    selectedMarket () {
      return this.networkMarketData[this.asset]
    },
    ethRequired () {
      return this.networkWalletBalances.ETH === 0
    },
    canSwap () {
      const amount = BN(this.safeAmount)

      if (this.ethRequired || amount.gt(this.max) || amount.lt(this.min) || amount.gt(this.balance)) return false

      return true
    },
    toAmount () {
      return dpUI(BN(this.safeAmount).times(this.bestRateBasedOnAmount), this.toAsset)
    }
  },
  methods: {
    getChainFromAsset,
    getAssetColor (asset) {
      const assetData = cryptoassets[asset.toLowerCase()]
      if (assetData.color) return { color: assetData.color }
    },
    getFeeLabelFromAsset (asset) {
      return cryptoassets[asset.toLowerCase()].fees.unit
    },
    ...mapGetters(['client']),
    ...mapActions(['newSwap', 'updateMarketData']),
    async updateFees (asset) {
      const chainAsset = getChainFromAsset(asset)
      const client = this.client()(this.activeNetwork, this.activeWalletId, chainAsset)
      const fees = await client.chain.getFees()
      this.fees = Object.assign({}, this.fees, {
        [chainAsset]: {
          values: fees,
          selected: 'average'
        }
      })
    },
    setAmount (amount) {
      this.amount = amount
    },
    setToAsset (val) {
      this.toAsset = val
      this.updateFees(this.toAsset)
    },
    async swap () {
      const fromFees = this.fees[getChainFromAsset(this.asset)]
      const fee = fromFees.values[fromFees.selected].fee
      const toFees = this.fees[getChainFromAsset(this.toAsset)]
      const toFee = toFees.values[toFees.selected].fee
      this.$router.push({
        name: 'SwapConfirm',
        params: {
          agent: this.bestAgent, asset: this.asset, toAsset: this.toAsset, amount: this.amount, toAmount: this.toAmount, rate: this.bestRateBasedOnAmount, sendTo: this.sendTo, fee, toFee
        }
      })
    }
  }
}
</script>

<style lang="scss">
.swap {
  &_asset {
    &.input-group {
      align-items: center;
    }

    &_icon {
      width: 28px;
      height: 28px;
      margin-right: 4px;
    }

    input {
      text-align: right;
      margin-left: 12px;
    }
  }

  &_fees {
    .btn-group label.btn {
      text-transform: capitalize;
    }

    &_asset {
      font-weight: bold;
      margin-bottom: 6px;
    }
  }
}
</style>
