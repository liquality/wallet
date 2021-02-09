<template>
  <div class="view-container">
    <div class="swap" v-if="!showConfirm">
      <NavBar
        showBack="true"
        :backPath="routeSource === 'assets' ? '/wallet' : `/account/${asset}`"
        :backLabel="routeSource === 'assets' ? 'Overview' : asset"
      >
        Swap
      </NavBar>
      <InfoNotification v-if="ethRequired">
        <EthRequiredMessage />
      </InfoNotification>

      <InfoNotification v-if="!market">
        <NoLiquidityMessage />
      </InfoNotification>
      <div class="wrapper form">
        <div class="wrapper_top">
          <div class="form-group">
            <span class="float-left"><label for="amount">Send</label></span>
            <div class="float-right btn btn-option label-append"
                 @click="toogleShowAmountsFiat">
              <span v-if="showAmountsInFiat" :style="getAssetColorStyle(asset)">
                {{ `${asset} ${sendAmount}` }}
              </span>
              <span v-else>
                {{ sendAmountFiat }}
              </span>
            </div>
            <div class="input-group swap_asset">
              <div class="input-group-append">
                <AssetDropdown :assets="assetList"
                           :selected="{name: asset, label: asset}"
                           @asset-changed="setAsset"
                           :show-search="true"
                />
              </div>
              <input
                v-if="showAmountsInFiat"
                type="text"
                class="form-control input-amount"
                :class="{ 'is-invalid': showErrors && amountError }"
                v-model="sendAmountFiat"
                placeholder="0.00"
                autocomplete="off"
                :disabled="!market"
              />
              <input
                v-else
                type="text"
                class="form-control input-amount"
                :class="{ 'is-invalid': showErrors && amountError }"
                v-model="sendAmount"
                placeholder="0.00"
                :style="getAssetColorStyle(asset)"
                autocomplete="off"
                :disabled="!market"
              />
            </div>
            <small
              v-if="showErrors && amountError"
              class="text-danger form-text text-right"
            >
              {{ amountError }}
            </small>
            <div class="form-text d-flex justify-content-between">
              <span class="label-sub">
                <span class="text-muted">Available</span>
                {{ available }} {{ asset }}
              </span>
              <div class="float-right btn-group">
                <v-popover offset="1" trigger="hover focus" class="mr-2">
                  <button
                    :class="{
                      active: amountOption === 'min' && market
                     }"
                    :disabled="!market"
                    class="btn btn-option"
                    @click="setSendAmount(min)"
                  >
                    Min
                  </button>
                  <template slot="popover">
                    <p class="my-0 text-right">{{ min }} {{ asset }}</p>
                    <p class="text-muted my-0 text-right">
                      {{ prettyFiatBalance(min, fiatRates[asset]) }} USD
                    </p>
                  </template>
                </v-popover>
                <v-popover offset="1" trigger="hover focus">
                  <button
                     :class="{
                      active: amountOption === 'max' && market
                     }"
                     :disabled="!market"
                    class="btn btn-option tooltip-target"
                    @click="setSendAmount(max)"
                  >
                    Max
                  </button>
                  <template slot="popover">
                    <p class="my-0 text-right">{{ max }} {{ asset }}</p>
                    <p class="text-muted my-0 text-right">
                      {{ prettyFiatBalance(max, fiatRates[asset]) }} USD
                    </p>
                  </template>
                </v-popover>
              </div>
            </div>
          </div>
          <div class="form-group mt-30">
            <span class="float-left">
              <label for="amount">Receive</label>
            </span>
            <div class="float-right btn btn-option label-append"
                 @click="toogleShowAmountsFiat">
              <span v-if="showAmountsInFiat" :style="getAssetColorStyle(toAsset)">
                {{ `${toAsset} ${receiveAmount}` }}
              </span>
              <span v-else>
                {{ receiveAmountFiat }}
              </span>
            </div>
            <div class="input-group swap_asset">
              <div class="input-group-append">
                <AssetDropdown :assets="toAssetList"
                          :selected="{name: toAsset, label: toAsset}"
                          @asset-changed="setToAsset"
                          :show-search="true"
                />
              </div>
              <input
                v-if="showAmountsInFiat"
                type="text"
                class="form-control input-amount"
                v-model="receiveAmountFiat"
                placeholder="0.00"
                autocomplete="off"
                :disabled="!market"
              />
              <input
                v-else
                type="text"
                class="form-control input-amount"
                v-model="receiveAmount"
                placeholder="0.00"
                :style="getAssetColorStyle(toAsset)"
                autocomplete="off"
                :disabled="!market"
              />
            </div>
            <small
              class="form-text d-flex justify-content-between"
              v-if="!enterSendToAddress"
            >
              <div class="swap_limits">
                <a @click="enterSendToAddress = true">
                  + Receive at external address
                </a>
              </div>
            </small>
          </div>
          <div class="form-group" v-if="enterSendToAddress">
            <label class="w-100 d-flex align-items-center justify-content-between" for="amount">
              <div>Receive at</div>
              <div>
                <CloseIcon
                class="float-right icon-sm icon-btn"
                @click="
                  enterSendToAddress = false;
                  sendTo = null;
                "
              />
              </div>
            </label>
            <div class="input-group">
              <input
                type="text"
                v-model="sendTo"
                class="form-control form-control-sm"
                id="to"
                placeholder="External Receiving Address"
                autocomplete="off"
              />
            </div>
          </div>
        </div>
        <div class="mt-3 form-group">
          <label>Rate</label>
          <p>
            <span class="swap-rate_base">1 {{ asset }} =</span>
            <span class="swap-rate_value">
              &nbsp;{{ bestRateBasedOnAmount }}
            </span>
            <span class="swap-rate_term text-muted">&nbsp;{{ toAsset }}</span>
          </p>
        </div>

        <div class="form-group swap_fees" v-if="availableFees.size">
          <DetailsContainer>
            <template v-slot:header>
              <span class="details-title">Network Speed/Fee</span>
              <span class="text-muted">
                {{ assetChain }}
                {{ getSelectedFeeLabel(selectedFee[assetChain]) }}
              </span>
              <span class="text-muted" v-if="assetChain != toAssetChain">
                /{{ toAssetChain }}
                {{ getSelectedFeeLabel(selectedFee[toAssetChain]) }}
              </span>
            </template>
            <template v-slot:content>
              <ul class="selectors">
                <li v-for="asset in availableFees" :key="asset">
                  <span class="selectors-asset">{{ asset }}</span>
                  <FeeSelector
                    :asset="asset"
                    v-model="selectedFee[asset]"
                    v-bind:fees="getAssetFees(asset)"
                    v-bind:txTypes="getFeeTxTypes(asset)"
                    v-bind:fiatRates="fiatRates"
                  />
                </li>
              </ul>
            </template>
          </DetailsContainer>
        </div>
        <div class="wrapper_bottom">
          <div class="button-group">
            <router-link :to="routeSource === 'assets' ? '/wallet' : `/account/${asset}`">
              <button class="btn btn-light btn-outline-primary btn-lg">
                Cancel
              </button>
            </router-link>
            <button
              class="btn btn-primary btn-lg"
              @click="showConfirm = true"
              :disabled="!canSwap"
            >
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="swap" v-else>
      <NavBar :showBackButton="true" :backClick="back" backLabel="Back">
        Swap
      </NavBar>
      <div class="swap-confirm wrapper form">
        <div class="wrapper_top form">
          <div>
            <label> Send </label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div class="confirm-value" :style="getAssetColorStyle(asset)">
                {{ sendAmount }} {{ asset }}
              </div>
              <div class="details-text">{{ sendAmountFiat }}</div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted"> Network Fee </label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div>~{{ totalFees[assetChain] }} {{ sendFeeType }}</div>
              <div class="details-text">
                ${{
                  prettyFiatBalance(totalFees[assetChain], fiatRates[assetChain])
                }}
              </div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted"> Amount + Fees </label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div class="font-weight-bold">
                <span v-if="asset === assetChain">
                  {{ sendAmountSameAsset }} {{ sendFeeType }}
                </span>
                <span v-else>
                  {{ sendAmount }} {{ asset }} + {{ totalFees[assetChain] }} {{ sendFeeType }}
                </span>
              </div>
              <div class="font-weight-bold">${{ totalToSendInFiat }}</div>
            </div>
          </div>

          <div class="mt-20">
            <label> Receive </label>
            <div class="d-flex align-items-center justify-content-between my-0 py-0">
              <div class="confirm-value" :style="getAssetColorStyle(toAsset)">
                {{ receiveAmount }} {{ toAsset }}
              </div>
              <div class="details-text">{{ receiveAmountFiat }}</div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted"> Network Fee </label>
            <div class="d-flex align-items-center justify-content-between my-0 py-0">
              <div>~{{ totalFees[toAssetChain] }} {{ receiveFeeType }}</div>
              <div class="details-text">
                ${{
                  prettyFiatBalance(totalFees[toAssetChain], fiatRates[toAssetChain])
                }}
              </div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted"> Amount - Fees </label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div class="font-weight-bold">
                <span v-if="toAsset === toAssetChain">
                  {{ receiveAmountSameAsset }} {{ receiveFeeType }}
                </span>
                <span v-else>
                  {{ receiveAmount }} {{ toAsset }} - {{ totalFees[toAssetChain] }} {{ receiveFeeType }}
                </span>
              </div>
              <div class="font-weight-bold">${{ totalToReceiveInFiat }}</div>
            </div>
          </div>
          <div class="detail-group" v-if="sendTo">
            <label class="text-muted"> Receive At </label>
                {{ shortenAddress(sendTo) }}
                <CopyIcon
                  class="copy-icon"
                  @click="copy(sendTo)"
                  v-tooltip.bottom="{
                    content: sendToCopied ? 'Copied!' : 'Copy',
                    hideOnTargetClick: false,
                  }"
                />
          </div>
          <div class="mt-20">
            <label> Rate </label>
            <div class="d-flex align-items-center justify-content-between my-0 py-0">
              <div v-if="market">
                1 {{ asset }}&nbsp;=&nbsp;{{ bestRateBasedOnAmount }} &nbsp;{{
                  toAsset
                }}
              </div>
              <div v-else>
                1 {{ asset }}&nbsp;=&nbsp;N/A
              </div>
            </div>
          </div>
        </div>
        <div class="wrapper_bottom">
          <div class="swap-info">
            <div class="media">
              <ClockIcon class="swap-info_clock" />
              <p class="text-muted media-body">
                If the swap doesn’t complete in 3 hours, you will be refunded in
                6 hours at {{ expiration }}
              </p>
            </div>
          </div>
          <div class="button-group">
            <button
              class="btn btn-light btn-outline-primary btn-lg"
              v-if="!loading"
              @click="showConfirm = false"
            >
              Edit
            </button>
            <button
              class="btn btn-primary btn-lg btn-block btn-icon"
              @click="swap"
              :disabled="loading"
            >
              <SpinnerIcon class="btn-loading" v-if="loading" />
              <template v-else>
                <SwapIcon />
                Initiate Swap
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import BN from 'bignumber.js'
import { add, format } from 'date-fns'
import cryptoassets from '@/utils/cryptoassets'
import FeeSelector from '@/components/FeeSelector'
import NavBar from '@/components/NavBar'
import InfoNotification from '@/components/InfoNotification'
import EthRequiredMessage from '@/components/EthRequiredMessage'
import NoLiquidityMessage from '@/components/NoLiquidityMessage'
import {
  dpUI,
  prettyBalance,
  prettyFiatBalance,
  cryptoToFiat,
  fiatToCrypto,
  formatFiat
} from '@/utils/coinFormatter'
import {
  getChainFromAsset,
  getAssetColorStyle,
  getAssetIcon
} from '@/utils/asset'
import { shortenAddress } from '@/utils/address'
import { TX_TYPES, FEE_TYPES, getTxFee, getFeeLabel } from '@/utils/fees'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ClockIcon from '@/assets/icons/clock.svg'
import CopyIcon from '@/assets/icons/copy.svg'
import CloseIcon from '@/assets/icons/close.svg'
import DetailsContainer from '@/components/DetailsContainer'
import AssetDropdown from '@/components/AssetDropdown'

export default {
  components: {
    NavBar,
    InfoNotification,
    EthRequiredMessage,
    NoLiquidityMessage,
    FeeSelector,
    ClockIcon,
    SwapIcon,
    SpinnerIcon,
    DetailsContainer,
    CopyIcon,
    CloseIcon,
    AssetDropdown
  },
  data () {
    return {
      showAmountsInFiat: false,
      stateSendAmount: 0,
      stateReceiveAmount: 0,
      stateSendAmountFiat: 0,
      stateReceiveAmountFiat: 0,
      amountOption: 'min',
      asset: null,
      toAsset: null,
      enterSendToAddress: false,
      sendTo: null,
      selectedFee: {},
      showConfirm: false,
      loading: false,
      sendToCopied: false
    }
  },
  props: {
    routeAsset: String
  },
  created () {
    this.asset = this.routeAsset
    this.toAsset = Object.keys(this.selectedMarket)[0] || 'N/A'
    this.sendAmount = this.min
    this.updateMarketData({ network: this.activeNetwork })
    this.updateFees({ asset: this.assetChain })
    if (this.toAssetChain) {
      this.updateFees({ asset: this.toAssetChain })
    }
    this.selectedFee = {
      [this.assetChain]: 'average',
      [this.toAssetChain]: 'average'
    }
  },
  computed: {
    routeSource () {
      return this.$route.query.source || null
    },
    sendAmount: {
      get () {
        return this.stateSendAmount
      },
      set (newValue) {
        this.stateSendAmount = newValue
        if (this.bestRateBasedOnAmount) {
          this.stateReceiveAmount = dpUI(BN(newValue).times(this.bestRateBasedOnAmount))
        } else {
          this.stateReceiveAmount = 0
        }
        this.stateSendAmountFiat = prettyFiatBalance(this.stateSendAmount, this.fiatRates[this.asset])
        this.stateReceiveAmountFiat = prettyFiatBalance(this.stateReceiveAmount, this.fiatRates[this.toAsset])
      }
    },
    receiveAmount: {
      get () {
        return this.stateReceiveAmount
      },
      set (newValue) {
        this.stateReceiveAmount = newValue
        if (this.bestRateBasedOnAmount) {
          this.stateSendAmount = dpUI(BN(newValue).dividedBy(this.bestRateBasedOnAmount))
        } else {
          this.stateSendAmount = 0
        }
        this.stateSendAmountFiat = prettyFiatBalance(this.stateSendAmount, this.fiatRates[this.asset])
        this.stateReceiveAmountFiat = prettyFiatBalance(this.stateReceiveAmount, this.fiatRates[this.toAsset])
      }
    },
    sendAmountFiat: {
      get () {
        return `$${this.stateSendAmountFiat}`
      },
      set (newValue) {
        const value = (newValue || '0').replace('$', '')
        this.stateSendAmountFiat = value
        this.stateSendAmount = fiatToCrypto(value, this.fiatRates[this.asset])
        if (this.bestRateBasedOnAmount) {
          this.stateReceiveAmount = dpUI(BN(this.stateSendAmount).times(this.bestRateBasedOnAmount))
        } else {
          this.stateReceiveAmount = 0
        }
        this.stateReceiveAmountFiat = prettyFiatBalance(this.stateReceiveAmount, this.fiatRates[this.toAsset])
      }
    },
    receiveAmountFiat: {
      get () {
        return `$${this.stateReceiveAmountFiat}`
      },
      set (newValue) {
        const value = (newValue || '0').replace('$', '')
        this.stateReceiveAmountFiat = value
        this.stateReceiveAmount = fiatToCrypto(value, this.fiatRates[this.toAsset])
        if (this.bestRateBasedOnAmount) {
          this.stateSendAmount = dpUI(BN(this.stateReceiveAmount)
            .dividedBy(this.bestRateBasedOnAmount)
          )
        } else {
          this.stateSendAmount = 0
        }
        this.stateSendAmountFiat = prettyFiatBalance(this.stateSendAmount, this.fiatRates[this.asset])
      }
    },
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'marketData',
      'balances',
      'fees',
      'fiatRates',
      'addresses',
      'activeWalletId',
      'activeNetwork'
    ]),
    ...mapGetters(['assetsWithBalance']),
    assets () {
      return this.assetsWithBalance.filter(
        ([asset]) => asset !== this.asset
      ).map(([asset]) => asset)
    },
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
      return this.bestMarketBasedOnAmount?.agent
    },
    bestRateBasedOnAmount () {
      return this.bestMarketBasedOnAmount?.sellRate
    },
    bestMarketBasedOnAmount () {
      const amount = BN(this.safeAmount)
      return this.market?.markets.slice().sort((a, b) => {
        if (a && a.sellMin && a.sellMax) {
          if (amount.gte(BN(a.sellMin)) &&
            amount.lte(BN(a.sellMax))
          ) {
            return -1
          } else if (amount.gte(BN(a.sellMin)) &&
                    amount.lte(BN(a.sellMax))
          ) {
            return 1
          }
        } else {
          return 0
        }
      })[0]
    },
    min () {
      let min = 0
      if (this.market && this.market.sellMin) {
        min = this.market.sellMin
      }
      return dpUI(BN(min))
    },
    max () {
      let max = 0
      if (this.market && this.market.sellMax) {
        max = this.market.sellMax
      }
      return BN.min(
        BN(this.available),
        dpUI(max)
      )
    },
    safeAmount () {
      return this.sendAmount || 0
    },
    market () {
      return this.selectedMarket[this.toAsset]
    },
    available () {
      const balance = this.networkWalletBalances[this.asset]
      const fee = cryptoassets[this.assetChain].currencyToUnit(
        this.totalFees[this.assetChain]
      )
      const available =
        this.assetChain !== this.asset
          ? BN(balance)
          : BN.max(BN(balance).minus(fee), 0)
      return prettyBalance(available, this.asset)
    },
    selectedMarket () {
      return this.networkMarketData[this.asset]
    },
    ethRequired () {
      return [this.assetChain, this.toAssetChain].includes('ETH') && this.networkWalletBalances.ETH === 0
    },
    showErrors () {
      return !this.ethRequired
    },
    amountError () {
      const amount = BN(this.safeAmount)

      if (amount.gt(this.available)) {
        return 'Lower amount. This exceeds available balance.'
      }
      if (amount.gt(this.max)) {
        return 'Please reduce amount. It exceeds maximum.'
      }
      if (amount.lt(this.min)) {
        return 'Please increase amount. It is below minimum.'
      }

      return null
    },
    canSwap () {
      if (!this.market ||
          this.ethRequired ||
          this.amountError) {
        return false
      }

      return true
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
      if (toFees && Object.keys(toFees).length) {
        availableFees.add(this.toAssetChain)
      }
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
        const feePrice = this.getAssetFees(this.assetChain)[
          this.selectedFee[this.assetChain]
        ].fee
        const initiationFee = getTxFee(
          this.asset,
          TX_TYPES.SWAP_INITIATION,
          feePrice
        )
        fees[this.assetChain] = initiationFee
      }

      if (this.availableFees.has(this.toAssetChain)) {
        const feePrice = this.getAssetFees(this.toAssetChain)[
          this.selectedFee[this.toAssetChain]
        ].fee
        const claimFee = getTxFee(this.toAsset, TX_TYPES.SWAP_CLAIM, feePrice)
        fees[this.toAssetChain] = fees[this.toAssetChain]
          ? fees[this.toAssetChain].plus(claimFee)
          : claimFee

        if (this.sendTo) {
          const sendFee = getTxFee(this.toAsset, TX_TYPES.SEND, feePrice)
          fees[this.toAssetChain] = fees[this.toAssetChain]
            ? fees[this.toAssetChain].plus(sendFee)
            : sendFee
        }
      }

      return fees
    },
    sendFeeType () {
      return FEE_TYPES[this.assetChain]
    },
    receiveFeeType () {
      return FEE_TYPES[this.toAssetChain]
    },
    includeFees () {
      return this.sendFeeType === FEE_TYPES.BTC
    },
    currentWalletAddress () {
      const address = this.addresses[this.activeNetwork]?.[
        this.activeWalletId
      ]?.[this.asset]
      return address && cryptoassets[this.asset].formatAddress(address)
    },
    sendAmountSameAsset () {
      return BN(this.safeAmount).plus(this.totalFees[this.assetChain])
    },
    totalToSendInFiat () {
      const fee = BN(prettyFiatBalance(this.totalFees[this.assetChain], this.fiatRates[this.assetChain]))
      const amount = BN(this.stateSendAmountFiat).plus(fee)
      return amount.toFormat(2)
    },
    receiveAmountSameAsset () {
      return BN(this.receiveAmount).minus(BN(this.totalFees[this.toAssetChain]))
    },
    totalToReceiveInFiat () {
      const fee = prettyFiatBalance(this.totalFees[this.toAssetChain], this.fiatRates[this.toAssetChain])
      const amount = BN(this.stateReceiveAmountFiat).minus(fee)
      return amount.toFormat(2)
    },
    assetList () {
      return this.assets.map(a => ({ name: a, label: a }))
    },
    toAssetList () {
      return this.toAssets.map(a => ({ name: a, label: a }))
    }
  },
  methods: {
    ...mapActions(['updateMarketData', 'updateFees', 'newSwap']),
    shortenAddress,
    prettyBalance,
    prettyFiatBalance,
    getAssetIcon,
    getAssetColorStyle,
    cryptoToFiat,
    fiatToCrypto,
    formatFiat,
    getAssetFees (asset) {
      return this.fees[this.activeNetwork]?.[this.activeWalletId]?.[asset]
    },
    getFeeTxTypes (asset) {
      if (asset === this.assetChain) {
        return [TX_TYPES.SWAP_INITIATION]
      }
      if (asset === this.toAssetChain) {
        return this.sendTo
          ? [TX_TYPES.SWAP_INITIATION, TX_TYPES.SEND]
          : [TX_TYPES.SWAP_INITIATION]
      }
    },
    setSendAmount (amount) {
      this.sendAmount = amount
      if (amount === this.max) {
        this.amountOption = 'max'
      } else {
        this.amountOption = 'min'
      }
    },
    setToAsset (val) {
      this.toAsset = val.name
      if (this.amountOption === 'max') {
        this.sendAmount = this.max
      } else {
        this.sendAmount = this.stateSendAmount
      }

      this.resetFees()
    },
    setAsset (val) {
      this.asset = val.name
      this.toAsset = Object.keys(this.selectedMarket)[0]
      this.sendAmount = this.min
      this.resetFees()
    },
    resetFees () {
      this.updateFees({ asset: this.assetChain })
      this.updateFees({ asset: this.toAssetChain })
      this.selectedFee = {
        [this.assetChain]: 'average',
        [this.toAssetChain]: 'average'
      }
    },
    async swap () {
      const fromAmount = cryptoassets[this.asset].currencyToUnit(this.safeAmount)

      const fee = this.availableFees.has(this.assetChain)
        ? this.getAssetFees(this.assetChain)[this.selectedFee[this.assetChain]]
          .fee
        : undefined

      const toFee = this.availableFees.has(this.toAssetChain)
        ? this.getAssetFees(this.toAssetChain)[
          this.selectedFee[this.toAssetChain]
        ].fee
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
    },
    getSelectedFeeLabel (fee) {
      return getFeeLabel(fee)
    },
    async copy (text) {
      await navigator.clipboard.writeText(text)
      this.sendToCopied = true
      setTimeout(() => {
        this.sendToCopied = false
      }, 3000)
    },
    back () {
      this.showConfirm = false
    },
    toogleShowAmountsFiat () {
      this.showAmountsInFiat = !this.showAmountsInFiat
    }
  },
  watch: {
    selectedFee: {
      handler (val) {
        if (this.amountOption === 'max') {
          this.sendAmount = this.max
        }
      },
      deep: true
    }
  }
}
</script>

<style lang="scss">
.swap {
  overflow-y: auto;
  padding-bottom: 70px;
  height: 100%;

  &_asset {
    &.input-group {
      align-items: center;
    }

    &_icon {
      margin-right: 4px;
    }

    .input-amount {
      text-align: right;
      margin-left: 0px;
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
      height: 10px;
      width: 10px;
      object-fit: contain;
    }
    p {
      font-size: $font-size-sm;
    }
  }
}

.switch-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 20px;
  margin-bottom: 0px;

  svg {
    cursor: pointer;
    height: 18px;
    &.up {
      transform: rotate(180deg);
    }
  }
}
</style>
