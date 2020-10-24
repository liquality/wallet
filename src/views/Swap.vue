<template>
  <div>
    <div class="swap" v-if="!showConfirm">
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
              <span class="label-sub"><span class="text-muted">Available</span> {{available}} {{asset}}</span>
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
              <FeeSelector :asset="asset" v-model="selectedFee[asset]" v-bind:fees="getAssetFees(asset)" v-bind:txTypes="getFeeTxTypes(asset)" />
            </div>
          </div>

          <div class="button-group">
            <router-link :to="`/account/${asset}`"><button class="btn btn-light btn-outline-primary btn-lg">Cancel</button></router-link>
            <button class="btn btn-primary btn-lg" @click="showConfirm = true" :disabled="!bestMarketBasedOnAmount || !canSwap">Review Terms</button>
          </div>
        </div>
      </div>
    </div>
    <div class="swap-confirm wrapper form text-center" v-if="showConfirm">
      <div class="wrapper_top form">
        <div class="form-group">
          <label>Send</label>
          <p class="confirm-value" :style="getAssetColorStyle(asset)">{{amount}} {{asset}}</p>
          <p class="text-muted">${{prettyFiatBalance(amount, fiatRates[asset])}}</p>
        </div>
        <div class="form-group">
          <label>Receive</label>
          <p class="confirm-value" :style="getAssetColorStyle(toAsset)">{{toAmount}} {{toAsset}}</p>
        </div>
        <div v-if="sendTo" class="form-group">
          <label>At</label>
          <p class="confirm-value">{{ shortenAddress(sendTo) }}</p>
        </div>
        <div class="swap-rate form-group">
          <label>Rate</label>
          <p><span class="swap-rate_base">1 {{asset}} =</span><span class="swap-rate_value">&nbsp;{{bestRateBasedOnAmount}}</span><span class="swap-rate_term">&nbsp;{{toAsset}}</span></p>
        </div>
        <div class="form-group">
          <label>Network Fees</label>
          <div v-for="(fee, asset) in totalFees" :key="asset">
            <template v-if="fee">~ {{ fee }}</template>
            <template v-else>Unknown</template>&nbsp;
            <span class="text-muted">{{ asset }}</span>&nbsp;
            <span v-if="fee">(${{prettyFiatBalance(fee, fiatRates[asset])}})</span>
          </div>
        </div>
      </div>

      <div class="wrapper_bottom">
        <div class="swap-info">
          <div class="media"><ClockIcon class="swap-info_clock" /><p class="text-muted media-body">If the swap doesn’t complete in 3 hours, you will be refunded in 6 hours at {{expiration}}</p></div>
          <Warning />
        </div>
        <div class="button-group">
          <button class="btn btn-light btn-outline-primary btn-lg" v-if="!loading" @click="showConfirm = false">Cancel</button>
          <button class="btn btn-primary btn-lg btn-block btn-icon" @click="swap" :disabled="loading">
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else><SwapIcon /> Initiate Swap</template>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import BN from 'bignumber.js'
import { add, format } from 'date-fns'
import cryptoassets from '@liquality/cryptoassets'
import FeeSelector from '@/components/FeeSelector'
import NavBar from '@/components/NavBar'
import InfoNotification from '@/components/InfoNotification'
import EthRequiredMessage from '@/components/EthRequiredMessage'
import { dpUI, prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import { getChainFromAsset, getAssetColorStyle } from '@/utils/asset'
import { shortenAddress } from '@/utils/address'
import { TX_TYPES, getTxFee } from '@/utils/fees'
import Warning from '@/components/Warning'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ClockIcon from '@/assets/icons/clock.svg'

export default {
  components: {
    NavBar,
    InfoNotification,
    EthRequiredMessage,
    FeeSelector,
    Warning,
    ClockIcon,
    SwapIcon,
    SpinnerIcon
  },
  data () {
    return {
      amount: 0,
      toAsset: null,
      enterSendToAddress: false,
      sendTo: null,
      selectedFee: {},
      showConfirm: false,
      loading: false
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
      const max = BN.min(BN(this.available), dpUI(this.market.sellMax, this.asset))
      return max
    },
    safeAmount () {
      return this.amount || 0
    },
    market () {
      return this.selectedMarket[this.toAsset]
    },
    available () {
      const balance = this.networkWalletBalances[this.asset]
      const fee = cryptoassets[this.assetChain].currencyToUnit(this.totalFees[this.assetChain])
      const available = this.assetChain !== this.asset
        ? BN(balance)
        : BN.max(BN(balance).minus(fee), 0)
      return prettyBalance(available, this.asset)
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

      if (amount.gt(this.available)) return 'Amount exceeds available balance.'
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
    },
    expiration: function () {
      return format(add(new Date(), { hours: 6 }), 'h:mm a')
    },
    totalFees () {
      const fees = {
        [this.assetChain]: null,
        [this.toAssetChain]: null
      }

      if (this.availableFees.has(this.assetChain)) {
        const feePrice = this.getAssetFees(this.assetChain)[this.selectedFee[this.assetChain]].fee
        const initiationFee = getTxFee(this.asset, TX_TYPES.SWAP_INITIATION, feePrice)
        fees[this.assetChain] = initiationFee
      }

      if (this.availableFees.has(this.toAssetChain)) {
        const feePrice = this.getAssetFees(this.toAssetChain)[this.selectedFee[this.toAssetChain]].fee
        const claimFee = getTxFee(this.toAsset, TX_TYPES.SWAP_CLAIM, feePrice)
        fees[this.toAssetChain] = fees[this.toAssetChain] ? fees[this.toAssetChain].plus(claimFee) : claimFee

        if (this.sendTo) {
          const sendFee = getTxFee(this.toAsset, TX_TYPES.SEND, feePrice)
          fees[this.toAssetChain] = fees[this.toAssetChain] ? fees[this.toAssetChain].plus(sendFee) : sendFee
        }
      }

      return fees
    }
  },
  methods: {
    ...mapActions(['updateMarketData', 'updateFees', 'newSwap']),
    shortenAddress,
    prettyBalance,
    prettyFiatBalance,
    getAssetColorStyle,
    getAssetFees (asset) {
      return this.fees[this.activeNetwork]?.[this.activeWalletId]?.[asset]
    },
    getFeeTxTypes (asset) {
      if (asset === this.assetChain) {
        return [TX_TYPES.SWAP_INITIATION]
      }
      if (asset === this.toAssetChain) {
        return this.sendTo ? [TX_TYPES.SWAP_INITIATION, TX_TYPES.SEND] : [TX_TYPES.SWAP_INITIATION]
      }
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
      const fromAmount = cryptoassets[this.asset].currencyToUnit(this.amount)

      const fee = this.availableFees.has(this.assetChain)
        ? this.getAssetFees(this.assetChain)[this.selectedFee[this.assetChain]].fee
        : undefined

      const toFee = this.availableFees.has(this.toAssetChain)
        ? this.getAssetFees(this.toAssetChain)[this.selectedFee[this.toAssetChain]].fee
        : undefined

      this.loading = true
      await this.newSwap({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        agent: this.bestAgent,
        from: this.asset,
        to: this.toAsset,
        fromAmount,
        sendTo: this.sendTo,
        fee,
        claimFee: toFee
      })

      this.$router.replace(`/account/${this.asset}`)
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

.swap-confirm {
  .swap-info {
    text-align: left;

    &_clock {
      margin-top: 6px;
      margin-right: 8px;
      height: 20px;
      width: 20px;
      object-fit: contain;
    }
    p {
      font-size: $font-size-sm;
    }
  }
}
</style>
