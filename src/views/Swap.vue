<template>
  <div class="swap">
    <NavBar showBack="true" :backPath="`/account/${asset}`" :backLabel="asset">
      Swap
    </NavBar>
    <InfoNotification v-if="ethRequired">
      <EthRequiredMessage />
    </InfoNotification>
    <div class="wrapper form">
      <div class="wrapper_top">
        <div class="form-group">
          <label for="amount">Send
            <span class="label-sub"><span class="text-muted">Available</span> {{balance}} {{asset}}</span>
            <span class="label-append">${{prettyFiatBalance(amount, fiatRates[asset])}}</span>
          </label>
          <div class="input-group swap_asset">
            <img :src="'./img/' + asset.toLowerCase() +'.png'" class="swap_asset_icon" />
            <div class="input-group-append">
              <span class="input-group-text">{{asset}}</span>
            </div>
            <input type="text" class="form-control" :class="{ 'is-invalid': showErrors && amountError }" id="amount" v-model="amount" placeholder="0.00" :style="getAssetColorStyle(asset)" autocomplete="off">
          </div>
          <small v-if="showErrors && amountError" class="text-danger form-text text-right">{{ amountError }}</small>
          <small class="form-text d-flex justify-content-between">
            <div class="swap_limits">
              <a @click="setAmount(min)">Min</a> {{min}} <a class="ml-1" @click="setAmount(max)">Max</a> {{max}}
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
                  <option v-for="to in toAssets" :key="to" :value="to">{{to}}</option>
                </select>
              </span>
            </div>
            <input type="text" class="form-control" readonly v-model="toAmount" placeholder="0.00" :style="getAssetColorStyle(toAsset)" autocomplete="off">
          </div>
          <small class="form-text d-flex justify-content-between" v-if="!enterSendToAddress">
            <div class="swap_limits">
              <a @click="enterSendToAddress = true">+ Receive at external address</a>
            </div>
          </small>
        </div>
        <div class="form-group" v-if="enterSendToAddress">
          <label class="w-100" for="amount">Receive at <a class="text-muted float-right" @click="enterSendToAddress = false; sendTo = null">X</a></label>
          <div class="input-group">
            <div class="input-group">
              <input type="text" v-model="sendTo" class="form-control form-control-sm" id="to" placeholder="External Receiving Address" autocomplete="off">
            </div>
          </div>
        </div>
      </div>
      <div class="wrapper_bottom">
        <div class="swap_rate form-group">
          <label>Rate</label>
          <p><span class="swap-rate_base">1 {{asset}} =</span><span class="swap-rate_value">&nbsp;{{bestRateBasedOnAmount}}</span><span class="swap-rate_term">&nbsp;{{toAsset}}</span></p>
        </div>

        <div class="form-group swap_fees" v-if="availableFees.size">
          <label>Network Speed/Fee</label>
          <div class="swap_fees_asset" v-for="asset in availableFees" :key="asset">
            {{ asset }}
            <FeeSelector :asset="asset" v-model="selectedFee[asset]" v-bind:fees="getAssetFees(asset)" />
          </div>
        </div>

        <div class="button-group">
          <router-link :to="`/account/${asset}`"><button class="btn btn-light btn-outline-primary btn-lg">Cancel</button></router-link>
          <button class="btn btn-primary btn-lg" @click="swap" :disabled="!bestMarketBasedOnAmount || !canSwap">Review Terms</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import BN from 'bignumber.js'
import FeeSelector from '@/components/FeeSelector'
import NavBar from '@/components/NavBar'
import InfoNotification from '@/components/InfoNotification'
import EthRequiredMessage from '@/components/EthRequiredMessage'
import { dpUI, prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import { getChainFromAsset, getAssetColorStyle } from '@/utils/asset'

export default {
  components: {
    NavBar,
    InfoNotification,
    EthRequiredMessage,
    FeeSelector
  },
  data () {
    return {
      amount: 0,
      toAsset: null,
      enterSendToAddress: false,
      sendTo: null,
      selectedFee: {}
    }
  },
  props: {
    asset: String
  },
  created () {
    this.toAsset = Object.keys(this.selectedMarket)[0]
    this.amount = this.min
    this.updateMarketData({ network: this.activeNetwork })
    this.updateFees({ asset: this.assetChain })
    this.updateFees({ asset: this.toAssetChain })
    this.selectedFee = {
      [this.assetChain]: 'average',
      [this.toAssetChain]: 'average'
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'marketData', 'balances', 'fees', 'fiatRates']),
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
      const amount = BN(this.amount)
      return this.market.markets.slice().sort((a, b) => {
        if (amount.gte(BN(a.sellMin)) && amount.lte(BN(a.sellMax))) return -1
        else if (amount.gte(BN(a.sellMin)) && amount.lte(BN(a.sellMax))) return 1
        else return 0
      })[0]
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
    showErrors () {
      return !this.ethRequired
    },
    amountError () {
      const amount = BN(this.safeAmount)

      if (amount.gt(this.balance)) return 'Amount exceeds available balance.'
      if ((this.asset === 'ETH' || this.asset === 'BTC') && amount.eq(this.balance)) return 'To account for the fee, lower this amount.'
      if (amount.gt(this.max)) return 'Please reduce amount. It exceeds maximum.'
      if (amount.lt(this.min)) return 'Please increase amount. It is below minimum.'

      return null
    },
    canSwap () {
      if (this.ethRequired || this.amountError) return false

      return true
    },
    toAmount () {
      return dpUI(BN(this.safeAmount).times(this.bestRateBasedOnAmount), this.toAsset)
    },
    assetChain () {
      return getChainFromAsset(this.asset)
    },
    toAssetChain () {
      return getChainFromAsset(this.toAsset)
    },
    availableFees () {
      const availableFees = new Set([])
      const fees = this.getAssetFees(this.assetChain)
      const toFees = this.getAssetFees(this.toAssetChain)
      if (fees && Object.keys(fees).length) availableFees.add(this.assetChain)
      if (toFees && Object.keys(toFees).length) availableFees.add(this.toAssetChain)
      return availableFees
    }
  },
  methods: {
    ...mapActions(['updateMarketData', 'updateFees']),
    prettyFiatBalance,
    getAssetColorStyle,
    getAssetFees (asset) {
      return this.fees[this.activeNetwork]?.[this.activeWalletId]?.[asset]
    },
    setAmount (amount) {
      this.amount = amount
    },
    setToAsset (val) {
      this.toAsset = val
      this.updateFees({ asset: this.toAssetChain })
      this.selectedFee = Object.assign({}, this.selectedFee, {
        [this.toAssetChain]: 'average'
      })
    },
    async swap () {
      const fee = this.availableFees.has(this.assetChain)
        ? this.getAssetFees(this.assetChain)[this.selectedFee[this.assetChain]].fee
        : undefined

      const toFee = this.availableFees.has(this.toAssetChain)
        ? this.getAssetFees(this.toAssetChain)[this.selectedFee[this.toAssetChain]].fee
        : undefined

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
    &_asset {
      display: flex;
      align-items: center;
      font-weight: bold;
      margin: 6px 0;

      .fee-selector {
        margin-left: 6px;
      }
    }
  }
}
</style>
