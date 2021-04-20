<template>
  <div class="view-container">
    <div class="swap" v-if="currentStep === 'inputs'">
      <NavBar
        showBack="true"
        :backPath="
          routeSource === 'assets'
            ? '/wallet'
            : `/accounts/${this.account.id}/${this.asset}`
        "
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
          <SendInput
            :asset="asset"
            :send-amount="sendAmount"
            :send-amount-fiat="sendAmountFiat"
            @update:sendAmount="(amount) => (sendAmount = amount)"
            @update:sendAmountFiat="(amount) => (sendAmountFiat = amount)"
            :max="max"
            :min="min"
            :available="available"
            :max-fiat="prettyFiatBalance(max, fiatRates[asset])"
            :min-fiat="prettyFiatBalance(min, fiatRates[asset])"
            :show-errors="showErrors"
            :amount-error="amountError"
            :has-market="!!market"
            @from-asset-click="fromAssetClick"
            :amount-option="amountOption"
            @send-amount-change="setSendAmount"
          />

          <ReceiveInput
            class="mt-30"
            :to-asset="toAsset"
            :receive-amount="receiveAmount"
            :receive-amount-fiat="receiveAmountFiat"
            :send-to="sendTo"
            @update:receiveAmount="(amount) => (receiveAmount = amount)"
            @update:receiveAmountFiat="(amount) => (receiveAmountFiat = amount)"
            @update:sendTo="(to) => (sendTo = to)"
            :has-market="!!market"
            @to-asset-click="toAssetClick"
          />
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
                {{ assetChain ? getSelectedFeeLabel(selectedFee[assetChain]) : '' }}
              </span>
              <span class="text-muted" v-if="assetChain != toAssetChain">
                /{{ toAssetChain }}
                {{ toAssetChain ? getSelectedFeeLabel(selectedFee[toAssetChain]) : '' }}
              </span>
            </template>
            <template v-slot:content>
              <ul class="selectors">
                <li v-for="assetFee in availableFees" :key="assetFee">
                  <span class="selectors-asset">{{ assetFee }}</span>
                  <FeeSelector
                    :asset="assetsFeeSelector[assetFee]"
                    v-model="selectedFee[assetFee]"
                    v-bind:fees="getAssetFees(assetFee)"
                    v-bind:txTypes="getFeeTxTypes(assetFee)"
                    v-bind:fiatRates="fiatRates"
                  />
                </li>
              </ul>
            </template>
          </DetailsContainer>
        </div>
        <div class="wrapper_bottom">
          <div class="button-group">
            <router-link
              :to="routeSource === 'assets' ? '/wallet' : `/accounts/${asset}`"
            >
              <button class="btn btn-light btn-outline-primary btn-lg">
                Cancel
              </button>
            </router-link>
            <button
              class="btn btn-primary btn-lg"
              @click="currentStep = 'confirm'"
              :disabled="!canSwap"
            >
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="swap" v-if="currentStep === 'confirm'">
      <NavBar :showBackButton="true" :backClick="back" backLabel="Back">
        Swap
      </NavBar>
      <div class="swap-confirm wrapper form">
        <div class="wrapper_top form">
          <div>
            <label>Send</label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div class="confirm-value" :style="getAssetColorStyle(asset)">
                {{ sendAmount }} {{ asset }}
              </div>
              <div class="details-text">{{ sendAmountFiat }}</div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted">Network Fee</label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div>~{{ totalFees[assetChain] }} {{ sendFeeType }}</div>
              <div class="details-text">
                ${{
                  prettyFiatBalance(
                    totalFees[assetChain],
                    fiatRates[assetChain],
                  )
                }}
              </div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted">Amount + Fees</label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div class="font-weight-bold">
                <span v-if="asset === assetChain">
                  {{ sendAmountSameAsset }} {{ sendFeeType }}
                </span>
                <span v-else>
                  {{ sendAmount }} {{ asset }} + {{ totalFees[assetChain] }}
                  {{ sendFeeType }}
                </span>
              </div>
              <div class="font-weight-bold">${{ totalToSendInFiat }}</div>
            </div>
          </div>

          <div class="mt-20">
            <label>Receive</label>
            <div
              class="d-flex align-items-center justify-content-between my-0 py-0"
            >
              <div class="confirm-value" :style="getAssetColorStyle(toAsset)">
                {{ receiveAmount }} {{ toAsset }}
              </div>
              <div class="details-text">{{ receiveAmountFiat }}</div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted">Network Fee</label>
            <div
              class="d-flex align-items-center justify-content-between my-0 py-0"
            >
              <div>~{{ totalFees[toAssetChain] }} {{ receiveFeeType }}</div>
              <div class="details-text">
                ${{
                  prettyFiatBalance(
                    totalFees[toAssetChain],
                    fiatRates[toAssetChain],
                  )
                }}
              </div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted">Amount - Fees</label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div class="font-weight-bold">
                <span v-if="toAsset === toAssetChain">
                  {{ receiveAmountSameAsset }} {{ receiveFeeType }}
                </span>
                <span v-else>
                  {{ receiveAmount }} {{ toAsset }} -
                  {{ totalFees[toAssetChain] }} {{ receiveFeeType }}
                </span>
              </div>
              <div class="font-weight-bold">${{ totalToReceiveInFiat }}</div>
            </div>
          </div>
          <div class="detail-group" v-if="sendTo">
            <label class="text-muted">Receive At</label>
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
            <label>Rate</label>
            <div
              class="d-flex align-items-center justify-content-between my-0 py-0"
            >
              <div v-if="market">
                1 {{ asset }}&nbsp;=&nbsp;{{ bestRateBasedOnAmount }} &nbsp;{{
                  toAsset
                }}
              </div>
              <div v-else>1 {{ asset }}&nbsp;=&nbsp;N/A</div>
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
              @click="currentStep = 'inputs'"
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
    <div class="swap" v-else>
      <NavBar :showBackButton="true" :backClick="back" backLabel="Back">
        Select Asset
      </NavBar>
      <Accounts :exclude-asset="assetSelection === 'to' ? asset : toAsset"
                :selected-market="selectedMarket"
                :asset-selection="assetSelection"
                @asset-selected="assetChanged"/>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import BN from 'bignumber.js'
import { add, format } from 'date-fns'
import cryptoassets from '@/utils/cryptoassets'
import { currencyToUnit } from '@liquality/cryptoassets'
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
  getNativeAsset,
  getAssetColorStyle,
  getAssetIcon
} from '@/utils/asset'
import { shortenAddress } from '@/utils/address'
import { TX_TYPES, FEE_TYPES, getTxFee, getFeeLabel } from '@/utils/fees'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ClockIcon from '@/assets/icons/clock.svg'
import CopyIcon from '@/assets/icons/copy.svg'
import DetailsContainer from '@/components/DetailsContainer'
import SendInput from './SendInput'
import ReceiveInput from './ReceiveInput'
import Accounts from './Accounts'

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
    SendInput,
    ReceiveInput,
    Accounts
  },
  data () {
    return {
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
      currentStep: 'inputs',
      assetSelection: 'from',
      loading: false,
      sendToCopied: false,
      toAccountId: null
    }
  },
  props: {
    routeAsset: String,
    accountId: String
  },
  created () {
    this.asset = this.routeAsset
    this.sendAmount = this.min
    this.updateMarketData({ network: this.activeNetwork })
    this.updateFees({ asset: this.assetChain })
    if (this.selectedMarket && Object.keys(this.selectedMarket).length > 0) {
      const toAsset = Object.keys(this.selectedMarket)[0]
      this.toAssetChanged(this.accountId, toAsset)
      this.toAsset = toAsset
      this.updateFees({ asset: toAsset })
      this.selectedFee = {
        [this.assetChain]: 'average',
        [this.toAssetChain]: 'average'
      }
    } else {
      this.selectedFee = {
        [this.assetChain]: 'average'
      }
    }
  },
  computed: {
    account () {
      return this.accountItem(this.accountId)
    },
    routeSource () {
      return this.$route.query.source || null
    },
    sendAmount: {
      get () {
        return this.stateSendAmount
      },
      set (newValue) {
        if (newValue && !isNaN(newValue)) {
          this.stateSendAmount = newValue
        } else {
          this.stateSendAmount = 0.0
        }

        if (this.bestRateBasedOnAmount) {
          this.stateReceiveAmount = dpUI(
            BN(this.stateSendAmount).times(this.bestRateBasedOnAmount)
          )
        } else {
          this.stateReceiveAmount = 0.0
        }
        this.stateSendAmountFiat = prettyFiatBalance(
          this.stateSendAmount,
          this.fiatRates[this.asset]
        )
        this.stateReceiveAmountFiat = prettyFiatBalance(
          this.stateReceiveAmount,
          this.fiatRates[this.toAsset]
        )
      }
    },
    receiveAmount: {
      get () {
        return this.stateReceiveAmount
      },
      set (newValue) {
        if (newValue && !isNaN(newValue)) {
          this.stateReceiveAmount = newValue
        } else {
          this.stateReceiveAmount = 0.0
        }
        if (this.bestRateBasedOnAmount) {
          this.stateSendAmount = dpUI(
            BN(this.stateReceiveAmount).dividedBy(this.bestRateBasedOnAmount)
          )
        } else {
          this.stateSendAmount = 0.0
        }
        this.stateSendAmountFiat = prettyFiatBalance(
          this.stateSendAmount,
          this.fiatRates[this.asset]
        )
        this.stateReceiveAmountFiat = prettyFiatBalance(
          this.stateReceiveAmount,
          this.fiatRates[this.toAsset]
        )
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
          this.stateReceiveAmount = dpUI(
            BN(this.stateSendAmount).times(this.bestRateBasedOnAmount)
          )
        } else {
          this.stateReceiveAmount = 0
        }
        this.stateReceiveAmountFiat = prettyFiatBalance(
          this.stateReceiveAmount,
          this.fiatRates[this.toAsset]
        )
      }
    },
    receiveAmountFiat: {
      get () {
        return `$${this.stateReceiveAmountFiat}`
      },
      set (newValue) {
        const value = (newValue || '0').replace('$', '')
        this.stateReceiveAmountFiat = value
        this.stateReceiveAmount = fiatToCrypto(
          value,
          this.fiatRates[this.toAsset]
        )
        if (this.bestRateBasedOnAmount) {
          this.stateSendAmount = dpUI(
            BN(this.stateReceiveAmount).dividedBy(this.bestRateBasedOnAmount)
          )
        } else {
          this.stateSendAmount = 0
        }
        this.stateSendAmountFiat = prettyFiatBalance(
          this.stateSendAmount,
          this.fiatRates[this.asset]
        )
      }
    },
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'marketData',
      'fees',
      'fiatRates',
      'activeWalletId',
      'activeNetwork'
    ]),
    ...mapGetters(['accountItem']),
    networkMarketData () {
      return this.marketData[this.activeNetwork]
    },
    networkWalletBalances () {
      return this.account?.balances
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
          if (amount.gte(BN(a.sellMin)) && amount.lte(BN(a.sellMax))) {
            return -1
          } else if (amount.gte(BN(a.sellMin)) && amount.lte(BN(a.sellMax))) {
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
      return this.available && !isNaN(this.available) ? BN.min(BN(this.available), dpUI(max)) : BN(0)
    },
    safeAmount () {
      return this.sendAmount || 0
    },
    market () {
      return this.selectedMarket[this.toAsset]
    },
    available () {
      const balance = this.networkWalletBalances[this.asset]
      const fee = currencyToUnit(cryptoassets[this.assetChain], this.totalFees[this.assetChain])
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
      return (
        [this.assetChain, this.toAssetChain].includes('ETH') &&
        this.networkWalletBalances.ETH === 0
      )
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
      if (!this.market || this.ethRequired || this.amountError) {
        return false
      }

      return true
    },
    assetChain () {
      return getNativeAsset(this.asset)
    },
    toAssetChain () {
      return getNativeAsset(this.toAsset)
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
        const fromTxTypes = this.getFeeTxTypes(this.assetChain)
        const fromAssetFee = this.getAssetFees(this.assetChain)[
          this.selectedFee[this.assetChain]
        ].fee

        const fromFee = fromTxTypes.reduce((accum, tx) => {
          return accum.plus(getTxFee(this.asset, tx, fromAssetFee))
        }, BN(0))

        fees[this.assetChain] = fromFee
      }

      if (this.availableFees.has(this.toAssetChain)) {
        const toTxTypes = this.getFeeTxTypes(this.toAssetChain)
        const toAssetFee = this.getAssetFees(this.toAssetChain)[
          this.selectedFee[this.toAssetChain]
        ].fee

        const toFee = toTxTypes.reduce((accum, tx) => {
          return accum.plus(getTxFee(this.toAsset, tx, toAssetFee))
        }, BN(0))

        fees[this.toAssetChain] = toFee
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
    sendAmountSameAsset () {
      return BN(this.safeAmount).plus(this.totalFees[this.assetChain])
    },
    totalToSendInFiat () {
      const fee = BN(
        prettyFiatBalance(
          this.totalFees[this.assetChain],
          this.fiatRates[this.assetChain]
        )
      )
      const amount = BN(this.stateSendAmountFiat).plus(fee)
      return amount.toFormat(2)
    },
    receiveAmountSameAsset () {
      return BN(this.receiveAmount).minus(BN(this.totalFees[this.toAssetChain]))
    },
    totalToReceiveInFiat () {
      const fee = prettyFiatBalance(
        this.totalFees[this.toAssetChain],
        this.fiatRates[this.toAssetChain]
      )
      const amount = BN(this.stateReceiveAmountFiat).minus(fee)
      return amount.toFormat(2)
    },
    assetsFeeSelector () {
      return {
        [this.assetChain]: this.asset,
        [this.toAssetChain]: this.toAsset
      }
    }
  },
  methods: {
    ...mapActions([
      'updateMarketData',
      'updateFees',
      'newSwap',
      'showNotification'
    ]),
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
          ? [TX_TYPES.SWAP_CLAIM, TX_TYPES.SEND]
          : [TX_TYPES.SWAP_CLAIM]
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
    setToAsset (toAsset) {
      this.toAsset = toAsset
      if (this.amountOption === 'max') {
        this.sendAmount = this.max
      } else {
        this.sendAmount = this.min
      }

      this.resetFees()
    },
    setFromAsset (asset) {
      this.asset = asset
      this.sendAmount = this.min
      this.resetFees()
    },
    resetFees () {
      const selectedFee = {}
      if (this.assetChain) {
        this.updateFees({ asset: this.assetChain })
        selectedFee[this.assetChain] = 'average'
      }
      if (this.toAssetChain) {
        this.updateFees({ asset: this.toAssetChain })
        selectedFee[this.toAssetChain] = 'average'
      }
      this.selectedFee = { ...selectedFee }
    },
    async swap () {
      try {
        const fromAmount = currencyToUnit(cryptoassets[this.asset], this.safeAmount)

        const fee = this.availableFees.has(this.assetChain)
          ? this.getAssetFees(this.assetChain)[
            this.selectedFee[this.assetChain]
          ].fee
          : undefined

        const toFee = this.availableFees.has(this.toAssetChain)
          ? this.getAssetFees(this.toAssetChain)[
            this.selectedFee[this.toAssetChain]
          ].fee
          : undefined

        this.loading = true
        const order = await this.newSwap({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          agent: this.bestAgent,
          from: this.asset,
          to: this.toAsset,
          fromAmount,
          sendTo: this.sendTo,
          fee,
          claimFee: toFee,
          fromAccountId: this.accountId,
          toAccountId: this.toAccountId
        })
        if (this.account?.type.includes('ledger')) {
          const unsubscribe = this.$store.subscribe(async (mutation) => {
            const { type, payload } = mutation
            if (type === '##BACKGROUND##UPDATE_HISTORY') {
              const { id, updates } = payload
              if (id && id === order.id && updates) {
                const { status, error } = updates
                if (error) {
                  console.error(error)
                  unsubscribe()
                  this.loading = false
                  const { message } = error
                  await this.showNotification({
                    title: 'Error',
                    message: message || error
                  })
                }

                if (status === 'INITIATED') {
                  unsubscribe()
                  this.loading = false
                  this.$router.replace(
                    `/accounts/${this.account?.id}/${this.asset}`
                  )
                }
              }
            }
          })
        } else {
          this.$router.replace(`/accounts/${this.account?.id}/${this.asset}`)
        }
      } catch (error) {
        console.error(error)
        const { message } = error
        this.loading = false
        await this.showNotification({
          title: 'Error',
          message: message || error
        })
      }
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
      this.currentStep = 'inputs'
    },
    toAssetClick () {
      this.assetSelection = 'to'
      this.currentStep = 'accounts'
    },
    fromAssetClick () {
      this.assetSelection = 'from'
      this.currentStep = 'accounts'
    },
    fromAssetChanged (accountId, fromAsset) {
      this.accountId = accountId
      this.setFromAsset(fromAsset)
    },
    toAssetChanged (accountId, toAsset) {
      this.toAccountId = accountId
      this.setToAsset(toAsset)
    },
    assetChanged ({ accountId, asset }) {
      if (this.assetSelection === 'to') {
        this.toAssetChanged(accountId, asset)
      } else {
        this.fromAssetChanged(accountId, asset)
      }
      this.currentStep = 'inputs'
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
