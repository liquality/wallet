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
        <EthRequiredMessage :account-id="account.id"/>
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
        <div class="mt-30 form-group swap-rate" id="rate_block">
          <label>Rate</label>
          <p>
            <span class="swap-rate_base">1 {{ asset }} =</span>
            <span class="swap-rate_value">
              &nbsp;{{ bestRate || '?' }}
            </span>
            <span class="swap-rate_term text-muted">&nbsp;{{ toAsset }}</span>
            <span v-if="bestQuote" class="badge badge-pill badge-primary text-uppercase ml-1">{{ bestQuoteProviderLabel }}</span>
            <span v-if="updatingQuotes" class="swap-rate_loading ml-1"><SpinnerIcon class="btn-loading" /> <strong>Seeking Liquidity...</strong></span>
          </p>
        </div>

        <div class="form-group swap_fees mt-30" v-if="bestQuote && availableFees.size">
          <DetailsContainer>
            <template v-slot:header>
              <span class="details-title" id="network_speed_fee">Network Speed/Fee</span>
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
              id="swap_review_button"
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
              <div class="confirm-value" id="send_swap_confirm_value" :style="getAssetColorStyle(asset)">
                {{ sendAmount }} {{ asset }}
              </div>
              <div class="details-text" id="send_swap_amount_fiat">{{ sendAmountFiat }}</div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted">Network Fee</label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div id="swap_send_network_fee_value">~{{ fromSwapFee }} {{ assetChain }}</div>
              <div class="details-text" id="swap_send_network_fee_fiat_rate">
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
              <div class="font-weight-bold" id="swap_send_amount_fees_value">
                <span v-if="asset === assetChain">
                  {{ sendAmountSameAsset }} {{ assetChain }}
                </span>
                <span v-else>
                  {{ sendAmount }} {{ asset }} + {{ fromSwapFee }}
                  {{ assetChain }}
                </span>
              </div>
              <div class="font-weight-bold" :class="{isHighFee: highFees}" id="swap_send_amount_fees_fiat_rate">${{ totalToSendInFiat }}</div>
            </div>
          </div>

          <div class="mt-20">
            <label>Receive</label>
            <div
              class="d-flex align-items-center justify-content-between my-0 py-0"
            >
              <div class="confirm-value" id="receive_swap_confirm_value" :style="getAssetColorStyle(toAsset)">
                {{ receiveAmount }} {{ toAsset }}
              </div>
              <div class="details-text" id="receive_swap_amount_fiat">{{ '$' + formatFiat(receiveAmountFiat) }}</div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted">Network Fee</label>
            <div
              class="d-flex align-items-center justify-content-between my-0 py-0"
              id="swap_receive_network_fee_value"
            >
              <div>~{{ toSwapFee }} {{ toAssetChain }}</div>
              <div class="details-text" id="swap_receive_network_fee_fiat_rate">
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
              <div class="font-weight-bold" id="swap_receive_amount_fee_value">
                <span v-if="toAsset === toAssetChain">
                  {{ receiveAmountSameAsset }} {{ toAssetChain }}
                </span>
                <span v-else>
                  {{ receiveAmount }} {{ toAsset }} -
                  {{ toSwapFee }} {{ toAssetChain }}
                </span>
              </div>
              <div class="font-weight-bold" id="swap_receive_total_amount_in_fiat">${{ totalToReceiveInFiat }}</div>
            </div>
          </div>
          <div class="mt-20">
            <label>Rate</label>
            <div
              class="d-flex align-items-center justify-content-between my-0 py-0"
              id="swap_rate_value"
            >
              <div v-if="bestQuote">
                1 {{ asset }}&nbsp;=&nbsp;{{ bestRate }} &nbsp;{{
                  toAsset
                }}
                <span class="badge badge-pill badge-primary text-uppercase ml-1" id="bestQuote_provider_label">{{ bestQuoteProviderLabel }}</span>
              </div>
              <div v-else>1 {{ asset }}&nbsp;=&nbsp;N/A</div>
            </div>
          </div>
        </div>
        <div class="wrapper_bottom">
          <div class="swap-info">
            <div class="media">
              <ClockIcon class="swap-info_clock" />
              <p class="text-muted media-body" id="media-body-info">
                If the swap doesn’t complete in 3 hours, you will be refunded in
                6 hours at {{ expiration }}
              </p>
            </div>
          </div>
          <div class="button-group">
            <button
              class="btn btn-light btn-outline-primary btn-lg"
              id="edit_swap_button"
              v-if="!loading"
              @click="currentStep = 'inputs'"
            >
              Edit
            </button>
            <button
              class="btn btn-primary btn-lg btn-block btn-icon"
              id="initiate_swap_button"
              @click.stop="tryToSwap"
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
    <LedgerBridgeModal :open="bridgeModalOpen" @close="closeBridgeModal" />
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
import { getFeeLabel } from '@/utils/fees'
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
import { SwapProviderType, getSwapProviderConfig } from '@/utils/swaps'
import LedgerBridgeModal from '@/components/LedgerBridgeModal'
import { BG_PREFIX } from '@/broker/utils'

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
    CustomFees,
    LedgerBridgeModal
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
      customFees: {},
      bridgeModalOpen: false,
      highFees: false
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
    isHighFee () {
      return this.toSwapFee >= this.sendAmount * 0.25
    },
    toAccount () {
      return this.toAccountId ? this.accountItem(this.toAccountId) : null
    },
    routeSource () {
      return this.$route.query.source || null
    },
    showNoLiquidityMessage () {
      return BN(this.sendAmount).gt(0) && (!this.bestQuote || BN(this.min).gt(this.max))
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
      return cryptoToFiat(this.receiveAmount, this.fiatRates[this.toAsset])
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
    ...mapState({
      usbBridgeTransportCreated: state => state.app.usbBridgeTransportCreated
    }),
    ...mapGetters(['client', 'swapProvider', 'accountItem', 'networkAccounts']),
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
    bestQuoteProviderLabel () {
      return getSwapProviderConfig(this.activeNetwork, this.bestQuote.provider).name
    },
    bestQuoteProvider () {
      if (!this.bestQuote) return null
      return this.swapProvider(this.activeNetwork, this.bestQuote.provider)
    },
    min () {
      const min = 0
      const liqualityMarket = this.networkMarketData.find(pair =>
        pair.from === this.asset &&
        pair.to === this.toAsset &&
        getSwapProviderConfig(this.activeNetwork, pair.provider).type === SwapProviderType.LIQUALITY)
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
      if (this.showNoLiquidityMessage) {
        return null
      }
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
      const send = cryptoToFiat(BN(this.stateSendAmount), this.fiatRates[this.asset])
      const fee = cryptoToFiat(this.fromSwapFee, this.fiatRates[this.assetChain])
      return send.plus(fee).toFormat(2)
    },
    receiveAmountSameAsset () {
      return BN(this.receiveAmount).minus(this.toSwapFee)
    },
    totalToReceiveInFiat () {
      const receive = cryptoToFiat(this.receiveAmount, this.fiatRates[this.toAsset])
      const fee = cryptoToFiat(this.toSwapFee, this.fiatRates[this.toAssetChain])
      return receive.minus(fee).toFormat(2)
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
    async _updateSwapFees (max) {
      if (!this.bestQuote) return
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

      const { fromTxType, toTxType } = this.bestQuoteProvider

      const addFees = async (asset, chain, txType) => {
        const assetFees = this.getAssetFees(chain)
        const totalFees = await this.bestQuoteProvider.estimateFees({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          accountId: this.accountId,
          asset,
          txType,
          quote: this.bestQuote,
          feePrices: Object.values(assetFees).map(fee => fee.fee),
          max
        })

        if (!totalFees) return

        for (const [speed, fee] of Object.entries(assetFees)) {
          fees[chain][speed] = fees[chain][speed].plus(totalFees[fee.fee])
        }
      }

      if (this.availableFees.has(this.assetChain)) {
        await addFees(this.asset, this.assetChain, fromTxType)
      }

      if (this.availableFees.has(this.toAssetChain)) {
        await addFees(this.toAsset, this.toAssetChain, toTxType, false)
      }

      if (max) {
        this.maxSwapFees = fees
      } else {
        this.swapFees = fees
      }
    },
    updateSwapFees: _.debounce(async function () {
      await this._updateSwapFees(false)
    }, 800),
    async updateMaxSwapFees () {
      await this._updateSwapFees(true)
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
    async tryToSwap () {
      if (this.account?.type.includes('ledger') && !this.usbBridgeTransportCreated) {
        this.loading = true
        this.bridgeModalOpen = true
        const unsubscribe = this.$store.subscribe(async ({ type, payload }) => {
          if (type === `${BG_PREFIX}app/SET_USB_BRIDGE_TRANSPORT_CREATED` &&
          payload.created === true) {
            this.bridgeModalOpen = false
            await this.swap()
            if (unsubscribe) {
              unsubscribe()
            }
          }
        })
        setTimeout(() => {
          if (unsubscribe) {
            this.bridgeModalOpen = false
            this.loading = false
            unsubscribe()
          }
        }, 25000)
      } else {
        await this.swap()
      }
    },
    updateQuotes: _.debounce(async function () {
      if (BN(this.sendAmount).eq(0)) return

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
        this.updateSwapFees()
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
        this.updateSwapFees()
        this.customFees[asset] = fee
        this.selectedFee[asset] = 'custom'
      }
      this.currentStep = 'inputs'
    },
    onCustomFeeSelected (asset) {
      this.customFeeAssetSelected = getNativeAsset(asset)
      this.currentStep = 'custom-fees'
    },
    closeBridgeModal () {
      this.loading = false
      this.bridgeModalOpen = false
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
    stateSendAmount: function (val, oldVal) {
      if (BN(val).eq(oldVal)) return
      if (BN(val).eq(0)) {
        this.quotes = []
        return
      }

      const amount = BN(val)
      const max = dpUI(this.max)
      const min = dpUI(this.min)
      if (amount.eq(max)) {
        this.amountOption = 'max'
      } else {
        if (amount.eq(min)) this.amountOption = 'min'
        else this.amountOption = null
      }
      this.updateQuotes()
    },
    max: function (val, oldVal) {
      if (BN(val).eq(oldVal)) return

      if (this.amountOption === 'max') {
        this.sendAmount = dpUI(this.max)
      }
    },
    bestQuote: function () {
      this._updateSwapFees() // Skip debounce
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

  &_highFees {
    color: $danger;
    font-weight: bold;
  }

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
