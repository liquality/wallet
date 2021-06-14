<template>
  <div class="view-container">
    <div class="swap" v-if="currentStep === 'inputs'">
      <NavBar
        showBack="true"
        :backPath="
          routeSource === 'assets'
            ? '/wallet'
            : `/accounts/${account.id}/${asset}`
        "
        :backLabel="routeSource === 'assets' ? 'Overview' : asset"
      >
        Swap
      </NavBar>
      <InfoNotification v-if="ethRequired">
        <EthRequiredMessage />
      </InfoNotification>

      <InfoNotification v-else-if="showNoLiquidityMessage">
        <NoLiquidityMessage />
      </InfoNotification>
      <div class="wrapper form">
        <div class="wrapper_top">
          <SendInput
            :account="account"
            :asset="asset"
            :send-amount="sendAmount"
            :send-amount-fiat="sendAmountFiat"
            @update:sendAmount="(amount) => (sendAmount = amount)"
            @update:sendAmountFiat="(amount) => (sendAmountFiat = amount)"
            :max="dpUI(max)"
            :min="min"
            :available="dpUI(available)"
            :max-fiat="prettyFiatBalance(max, fiatRates[asset])"
            :min-fiat="prettyFiatBalance(min, fiatRates[asset])"
            :show-errors="showErrors"
            :amount-error="amountError"
            @from-asset-click="fromAssetClick"
            :amount-option="amountOption"
            @send-amount-change="setSendAmount"
          />

          <ReceiveInput
            class="mt-30"
            :account="toAccount"
            :to-asset="toAsset"
            :receive-amount="dpUI(receiveAmount)"
            :receive-amount-fiat="receiveAmountFiat"
            disabled
            @to-asset-click="toAssetClick"
          />
        </div>
        <div class="mt-30 form-group swap-rate">
          <label>Rate</label>
          <p>
            <span class="swap-rate_base">1 {{ asset }} =</span>
            <span class="swap-rate_value">
              &nbsp;{{ bestRate }}
            </span>
            <span class="swap-rate_term text-muted">&nbsp;{{ toAsset }}</span>
            <span v-if="bestQuote" class="badge badge-pill badge-primary text-uppercase ml-1">{{ bestQuote.protocol }}</span>
            <span v-if="updatingQuotes" class="swap-rate_loading ml-1"><SpinnerIcon class="btn-loading" /> <strong>Seeking Liquidity...</strong></span>
          </p>
        </div>

        <div class="form-group swap_fees mt-30" v-if="availableFees.size">
          <DetailsContainer>
            <template v-slot:header>
              <span class="details-title">Network Speed/Fee</span>
              <span class="text-muted">
                {{ assetChain }}
                {{ assetChain ? getSelectedFeeLabel(selectedFee[assetChain]) : '' }}
              </span>
              <span class="text-muted" v-if="toAssetChain && assetChain != toAssetChain">
                /{{ toAssetChain }}
                {{ toAssetChain ? getSelectedFeeLabel(selectedFee[toAssetChain]) : '' }}
              </span>
            </template>
            <template v-slot:content>
              <ul class="selectors">
                <li v-for="assetFee in availableFees" :key="assetFee">
                  <span class="selectors-asset">{{ assetFee }}</span>
                  <div v-if="customFees[assetFee]">
                    {{ getTotalSwapFee(assetFee) }} {{ assetFee }} / {{ getTotalSwapFeeInFiat(assetFee) }} USD
                    <button class="btn btn-link" @click="resetCustomFee(assetFee)">
                      Reset
                    </button>
                  </div>
                  <FeeSelector
                    v-else
                    :asset="assetsFeeSelector[assetFee]"
                    v-model="selectedFee[assetFee]"
                    :fees="getAssetFees(assetFee)"
                    :totalFees="amountOption === 'max' ? maxSwapFees[assetFee] : swapFees[assetFee]"
                    :fiatRates="fiatRates"
                    @custom-selected="onCustomFeeSelected"
                  />
                </li>
              </ul>
            </template>
          </DetailsContainer>
        </div>
        <div class="wrapper_bottom">
          <div class="button-group">
            <router-link
              :to="routeSource === 'assets' ? '/wallet' : `/accounts/${this.account.id}/${this.asset}`"
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
    <div class="swap" v-else-if="currentStep === 'custom-fees'">
      <CustomFees
        @apply="applyCustomFee"
        @update="setCustomFee"
        @cancel="cancelCustomFee(customFeeAssetSelected)"
        :asset="customFeeAssetSelected"
        :selected-fee="selectedFee[customFeeAssetSelected]"
        :fees="getAssetFees(customFeeAssetSelected)"
        :totalFees="amountOption === 'max' ? maxSwapFees[customFeeAssetSelected] : swapFees[customFeeAssetSelected]"
        :fiatRates="fiatRates"
      />
    </div>
    <div class="swap" v-else-if="currentStep === 'confirm'">
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
              <div>~{{ fromSwapFee }} {{ assetChain }}</div>
              <div class="details-text">
                ${{
                  prettyFiatBalance(
                    fromSwapFee,
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
                  {{ sendAmountSameAsset }} {{ assetChain }}
                </span>
                <span v-else>
                  {{ sendAmount }} {{ asset }} + {{ fromSwapFee }}
                  {{ assetChain }}
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
              <div>~{{ toSwapFee }} {{ toAssetChain }}</div>
              <div class="details-text">
                ${{
                  prettyFiatBalance(
                    toSwapFee,
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
                  {{ receiveAmountSameAsset }} {{ toAssetChain }}
                </span>
                <span v-else>
                  {{ receiveAmount }} {{ toAsset }} -
                  {{ toSwapFee }} {{ toAssetChain }}
                </span>
              </div>
              <div class="font-weight-bold">${{ totalToReceiveInFiat }}</div>
            </div>
          </div>
          <div class="mt-20">
            <label>Rate</label>
            <div
              class="d-flex align-items-center justify-content-between my-0 py-0"
            >
              <div v-if="bestQuote">
                1 {{ asset }}&nbsp;=&nbsp;{{ bestRate }} &nbsp;{{
                  toAsset
                }}
                <span class="badge badge-pill badge-primary text-uppercase ml-1">{{ bestQuote.protocol }}</span>
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
              @click.stop="swap"
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
                :asset-selection="assetSelection"
                @asset-selected="assetChanged"/>
    </div>
    <!-- Modals for ledger prompts -->
    <OperationErrorModal :open="swapErrorModalOpen"
                         :account="account"
                         @close="closeSwapErrorModal"
                         :error="swapErrorMessage" />
    <LedgerSignRequestModal :open="signRequestModalOpen"
                            @close="closeSignRequestModal" />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import _ from 'lodash'
import BN from 'bignumber.js'
import { add, format } from 'date-fns'
import cryptoassets from '@/utils/cryptoassets'
import { currencyToUnit, unitToCurrency } from '@liquality/cryptoassets'
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
  isERC20,
  getNativeAsset,
  getAssetColorStyle,
  getAssetIcon
} from '@/utils/asset'
import { shortenAddress } from '@/utils/address'
import { getSwapFee, getSwapTxTypes, getFeeLabel } from '@/utils/fees'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ClockIcon from '@/assets/icons/clock.svg'
import DetailsContainer from '@/components/DetailsContainer'
import SendInput from './SendInput'
import ReceiveInput from './ReceiveInput'
import Accounts from './Accounts'
import LedgerSignRequestModal from '@/components/LedgerSignRequestModal'
import OperationErrorModal from '@/components/OperationErrorModal'
import CustomFees from '@/components/CustomFees'
import { SwapProtocol, getSwapProtocolConfig } from '@/utils/swaps'

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
    SendInput,
    ReceiveInput,
    Accounts,
    LedgerSignRequestModal,
    OperationErrorModal,
    CustomFees
  },
  data () {
    return {
      stateSendAmount: 0,
      stateSendAmountFiat: 0,
      amountOption: 'min',
      asset: null,
      toAsset: null,
      quotes: [],
      updatingQuotes: false,
      swapFees: {},
      maxSwapFees: {},
      selectedFee: {},
      currentStep: 'inputs',
      assetSelection: 'from',
      loading: false,
      fromAccountId: null,
      toAccountId: null,
      swapErrorModalOpen: false,
      signRequestModalOpen: false,
      swapErrorMessage: '',
      customFeeAssetSelected: null,
      customFees: {}
    }
  },
  props: {
    routeAsset: String,
    accountId: String
  },
  created () {
    this.asset = this.routeAsset
    this.sendAmount = this.min
    this.fromAccountId = this.accountId
    this.updateMarketData({ network: this.activeNetwork })

    ;(async () => {
      await this.updateFees({ asset: this.assetChain })
      await this.updateMaxSwapFees()
    })()

    if (this.networkMarketData && Object.keys(this.networkMarketData).length > 0) {
      const toAsset = this.asset === 'BTC' ? 'ETH' : 'BTC'
      if (this.account &&
          this.account.assets &&
          this.account.assets.includes(toAsset)) {
        this.toAccountId = this.accountId
      } else {
        if (this.networkAccounts.length > 0) {
          const toAccount = this.networkAccounts.find(account => account.assets &&
                                       account.assets.includes(toAsset) &&
                                       account.id !== this.accountId)
          if (toAccount) {
            this.toAccountId = toAccount.id
          }
        }
      }

      if (this.toAccountId && toAsset) {
        this.toAssetChanged(this.toAccountId, toAsset)
        this.toAsset = toAsset
        this.updateFees({ asset: toAsset })
        this.selectedFee = {
          [this.assetChain]: 'average',
          [this.toAssetChain]: 'average'
        }
      }
    } else {
      this.selectedFee = {
        [this.assetChain]: 'average'
      }
    }
    this.interval = setInterval(() => {
      this.updateQuotes()
    }, 30000)
  },
  beforeDestroy () {
    clearInterval(this.interval)
  },
  computed: {
    account () {
      return this.accountItem(this.fromAccountId)
    },
    toAccount () {
      return this.toAccountId ? this.accountItem(this.toAccountId) : null
    },
    routeSource () {
      return this.$route.query.source || null
    },
    showNoLiquidityMessage () {
      return !this.bestQuote || BN(this.min).gt(this.max)
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

        this.stateSendAmountFiat = prettyFiatBalance(
          this.stateSendAmount,
          this.fiatRates[this.asset]
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
      }
    },
    receiveAmount () {
      return this.bestQuote ? unitToCurrency(cryptoassets[this.toAsset], this.bestQuote.toAmount) : BN(0)
    },
    receiveAmountFiat () {
      return prettyFiatBalance(this.receiveAmount, this.fiatRates[this.toAsset])
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
    ...mapGetters(['client', 'accountItem', 'networkAccounts']),
    networkMarketData () {
      return this.marketData[this.activeNetwork]
    },
    networkWalletBalances () {
      return this.account?.balances
    },
    bestRate () {
      if (!this.bestQuote) return null
      const fromAmount = unitToCurrency(cryptoassets[this.asset], this.bestQuote.fromAmount)
      const toAmount = unitToCurrency(cryptoassets[this.toAsset], this.bestQuote.toAmount)
      const rate = toAmount.div(fromAmount)
      return dpUI(rate)
    },
    bestQuote () {
      const sortedQuotes = this.quotes.slice(0).sort((a, b) => BN(b.toAmount).minus(a.toAmount).toNumber())
      return sortedQuotes[0]
    },
    min () {
      const min = 0
      const liqualityMarket = this.networkMarketData.find(pair =>
        pair.from === this.asset &&
        pair.to === this.toAsset &&
        getSwapProtocolConfig(this.activeNetwork, pair.protocol).type === SwapProtocol.LIQUALITY)
      if (liqualityMarket) {
        return dpUI(BN(liqualityMarket.min))
      }
      return dpUI(BN(min))
    },
    max () {
      return this.available && !isNaN(this.available) ? BN.min(BN(this.available)) : BN(0)
    },
    safeAmount () {
      return this.sendAmount || 0
    },
    fromSwapFee () {
      const selectedSpeed = this.selectedFee[this.assetChain]
      const fee = this.amountOption === 'max' ? this.maxSwapFees[this.assetChain]?.[selectedSpeed] : this.swapFees[this.assetChain]?.[selectedSpeed]
      return fee || BN(0)
    },
    toSwapFee () {
      const selectedSpeed = this.selectedFee[this.toAssetChain]
      const fee = this.amountOption === 'max' ? this.maxSwapFees[this.toAssetChain]?.[selectedSpeed] : this.swapFees[this.toAssetChain]?.[selectedSpeed]
      return fee || BN(0)
    },
    maxFee () {
      const selectedSpeed = this.selectedFee[this.assetChain]
      const fee = this.maxSwapFees[this.assetChain]?.[selectedSpeed]
      return fee ? currencyToUnit(cryptoassets[this.assetChain], fee) : BN(0)
    },
    available () {
      if (!this.networkWalletBalances) return BN(0)
      const balance = this.networkWalletBalances[this.asset]
      const available =
        isERC20(this.asset)
          ? BN(balance)
          : BN.max(BN(balance).minus(this.maxFee), 0)
      return unitToCurrency(cryptoassets[this.asset], available)
    },
    ethRequired () {
      if (this.assetChain === 'ETH') {
        return !this.account?.balances?.ETH || this.account?.balances?.ETH === 0
      }

      if (this.toAssetChain === 'ETH') {
        return !this.toAccount?.balances?.ETH || this.toAccount?.balances?.ETH === 0
      }

      return false
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
      if (!this.bestQuote ||
          this.ethRequired ||
          this.amountError ||
          BN(this.safeAmount).lte(0)) {
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
    sendAmountSameAsset () {
      return BN(this.safeAmount).plus(this.fromSwapFee)
    },
    totalToSendInFiat () {
      const amount = BN(this.stateSendAmount).plus(this.fromSwapFee)
      return cryptoToFiat(amount, this.fiatRates[this.assetChain]).toFormat(2)
    },
    receiveAmountSameAsset () {
      return BN(this.receiveAmount).minus(this.toSwapFee)
    },
    totalToReceiveInFiat () {
      const amount = this.receiveAmount.plus(this.toSwapFee)
      return cryptoToFiat(amount, this.fiatRates[this.toAssetChain]).toFormat(2)
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
      'getQuotes',
      'updateFees',
      'newSwap'
    ]),
    shortenAddress,
    dpUI,
    prettyBalance,
    prettyFiatBalance,
    getAssetIcon,
    getAssetColorStyle,
    cryptoToFiat,
    fiatToCrypto,
    formatFiat,
    getAssetFees (asset) {
      const assetFees = {}
      if (this.customFees[asset]) {
        assetFees.custom = { fee: this.customFees[asset] }
      }

      const fees = this.fees[this.activeNetwork]?.[this.activeWalletId]?.[asset]
      if (fees) {
        Object.assign(assetFees, fees)
      }

      return assetFees
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
      this.updateQuotes()
    },
    setFromAsset (asset) {
      this.asset = asset
      this.sendAmount = this.min
      this.resetFees()
      this.updateQuotes()
    },
    async _updateSwapFees (amount) {
      if (!this.bestQuote) return

      const getMax = amount === undefined

      const fees = {
        [this.assetChain]: {
          slow: BN(0),
          average: BN(0),
          fast: BN(0),
          custom: BN(0)
        },
        [this.toAssetChain]: {
          slow: BN(0),
          average: BN(0),
          fast: BN(0),
          custom: BN(0)
        }
      }

      const txTypes = getSwapTxTypes(getSwapProtocolConfig(this.activeNetwork, this.bestQuote.protocol).type)

      if (this.availableFees.has(this.assetChain)) {
        const getMax = amount === undefined
        const assetFees = this.getAssetFees(this.assetChain)

        if (txTypes.fromTxType === 'SWAP_INITIATION' && this.assetChain === 'BTC') {
          const client = this.client(this.activeNetwork, this.activeWalletId, this.assetChain)
          const feePerBytes = Object.values(assetFees).map(fee => fee.fee)
          const value = getMax ? undefined : currencyToUnit(cryptoassets[this.asset], BN(amount))
          const totalFees = await client.getMethod('getTotalFees')({ value, feePerBytes, max: getMax })

          for (const [speed, fee] of Object.entries(assetFees)) {
            const totalFee = unitToCurrency(cryptoassets[this.asset], totalFees[fee.fee])
            fees[this.assetChain][speed] = fees[this.assetChain][speed].plus(totalFee)
          }
        } else {
          for (const [speed, fee] of Object.entries(assetFees)) {
            const staticFee = getSwapFee(getSwapProtocolConfig(this.activeNetwork, this.bestQuote.protocol).type, txTypes.fromTxType, this.asset, fee.fee)
            fees[this.assetChain][speed] = fees[this.assetChain][speed].plus(staticFee)
          }
        }
      }

      if (this.availableFees.has(this.toAssetChain)) {
        const assetFees = this.getAssetFees(this.toAssetChain)
        for (const [speed, fee] of Object.entries(assetFees)) {
          const staticFee = getSwapFee(getSwapProtocolConfig(this.activeNetwork, this.bestQuote.protocol).type, txTypes.toTxType, this.toAsset, fee.fee)
          fees[this.toAssetChain][speed] = fees[this.toAssetChain][speed].plus(staticFee)
        }
      }

      if (getMax) {
        this.maxSwapFees = fees
      } else {
        this.swapFees = fees
      }
    },
    updateSwapFees: _.debounce(async function (amount) {
      await this._updateSwapFees(amount)
    }, 800),
    async updateMaxSwapFees () {
      await this._updateSwapFees()
    },
    resetFees () {
      const selectedFee = {}
      if (this.assetChain) {
        ;(async () => {
          await this.updateFees({ asset: this.assetChain })
          await this.updateMaxSwapFees()
        })()

        selectedFee[this.assetChain] = 'average'
      }
      if (this.toAssetChain) {
        this.updateFees({ asset: this.toAssetChain })
        selectedFee[this.toAssetChain] = 'average'
      }
      this.selectedFee = { ...selectedFee }
    },
    resetCustomFee (asset) {
      delete this.customFees[asset]
      this.resetFees()
    },
    cancelCustomFee (asset) {
      this.currentStep = 'inputs'
      this.selectedFee[asset] = 'average'
    },
    updateQuotes: _.debounce(async function () {
      this.updatingQuotes = true
      const quotes = await this.getQuotes({ network: this.activeNetwork, from: this.asset, to: this.toAsset, amount: BN(this.sendAmount) })
      if (quotes.every((quote) => quote.from === this.asset && quote.to === this.toAsset)) {
        this.quotes = quotes
      }
      this.updatingQuotes = false
    }, 1000),
    async swap () {
      this.swapErrorMessage = ''
      this.swapErrorModalOpen = false
      this.loading = true
      if (this.account?.type.includes('ledger')) {
        this.signRequestModalOpen = true
      }
      try {
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

        await this.newSwap({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          quote: this.bestQuote,
          fee,
          claimFee: toFee,
          fromAccountId: this.fromAccountId,
          toAccountId: this.toAccountId
        })

        this.signRequestModalOpen = false

        this.$router.replace(`/accounts/${this.account?.id}/${this.asset}`)
      } catch (error) {
        console.error(error)
        const { message } = error
        this.loading = false
        this.signRequestModalOpen = false
        this.swapErrorMessage = message || error
        this.swapErrorModalOpen = true
      }
    },
    getSelectedFeeLabel (fee) {
      return fee ? getFeeLabel(fee) : ''
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
      this.fromAccountId = accountId
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
    },
    closeSwapErrorModal () {
      this.swapErrorModalOpen = false
      this.loading = false
    },
    closeSignRequestModal () {
      this.signRequestModalOpen = false
      this.loading = false
    },
    getTotalSwapFee (asset) {
      if (asset === this.assetChain) {
        return this.fromSwapFee
      } else if (asset === this.toAssetChain) {
        return this.toSwapFee
      }
    },
    getTotalSwapFeeInFiat (asset) {
      const fee = this.getTotalSwapFee(asset)
      return prettyFiatBalance(fee, this.fiatRates[asset])
    },
    setCustomFee: _.debounce(async function ({ asset, fee }) {
      this.customFees[asset] = fee
      if (this.amountOption === 'max') {
        this.updateMaxSwapFees()
      } else {
        this.updateSwapFees(this.stateSendAmount)
      }
    }, 800),
    applyCustomFee ({ asset, fee }) {
      const assetFees = this.getAssetFees(asset)
      const presetFee = Object.entries(assetFees).find(([speed, speedFee]) => speed !== 'custom' && speedFee.fee === fee)
      if (presetFee) {
        const [speed] = presetFee
        this.selectedFee[asset] = speed
        this.customFees[asset] = null
      } else {
        this.updateMaxSwapFees()
        this.updateSwapFees(this.stateSendAmount)
        this.customFees[asset] = fee
        this.selectedFee[asset] = 'custom'
      }
      this.currentStep = 'inputs'
    },
    onCustomFeeSelected (asset) {
      this.customFeeAssetSelected = getNativeAsset(asset)
      this.currentStep = 'custom-fees'
    }
  },
  watch: {
    selectedFee: {
      handler () {
        if (this.amountOption === 'max') {
          this.sendAmount = dpUI(this.max)
        }
      },
      deep: true
    },
    stateSendAmount: function (val) {
      const amount = BN(val)
      const max = dpUI(this.max)
      const min = dpUI(this.min)
      if (amount.eq(max)) {
        this.amountOption = 'max'
      } else {
        if (amount.eq(min)) this.amountOption = 'min'
        else this.amountOption = null
        this.updateSwapFees(amount)
      }
      this.updateQuotes()
    },
    max: function () {
      if (this.amountOption === 'max') {
        this.sendAmount = dpUI(this.max)
      }
    },
    bestQuote: function () {
      this.updateSwapFees(this.stateSendAmount)
      this.updateMaxSwapFees()
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

.swap-rate {
  p {
    margin-bottom: 0;
  }

  &_loading {
    svg {
      height: 16px
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
