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
            :has-market="!!market"
            @from-asset-click="fromAssetClick"
            :amount-option="amountOption"
            @send-amount-change="setSendAmount"
          />

          <ReceiveInput
            class="mt-30"
            :account="toAccount"
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
              <div>~{{ fromSwapFee }} {{ sendFeeType }}</div>
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
                  {{ sendAmountSameAsset }} {{ sendFeeType }}
                </span>
                <span v-else>
                  {{ sendAmount }} {{ asset }} + {{ fromSwapFee }}
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
              <div>~{{ toSwapFee }} {{ receiveFeeType }}</div>
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
                  {{ receiveAmountSameAsset }} {{ receiveFeeType }}
                </span>
                <span v-else>
                  {{ receiveAmount }} {{ toAsset }} -
                  {{ toSwapFee }} {{ receiveFeeType }}
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
                :selected-market="selectedMarket"
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
import { TX_TYPES, FEE_TYPES, getTxFee, getFeeLabel } from '@/utils/fees'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ClockIcon from '@/assets/icons/clock.svg'
import CopyIcon from '@/assets/icons/copy.svg'
import DetailsContainer from '@/components/DetailsContainer'
import SendInput from './SendInput'
import ReceiveInput from './ReceiveInput'
import Accounts from './Accounts'
import LedgerSignRequestModal from '@/components/LedgerSignRequestModal'
import OperationErrorModal from '@/components/OperationErrorModal'
import CustomFees from '@/components/CustomFees'

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
    Accounts,
    LedgerSignRequestModal,
    OperationErrorModal,
    CustomFees
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
      swapFees: {},
      maxSwapFees: {},
      selectedFee: {},
      currentStep: 'inputs',
      assetSelection: 'from',
      loading: false,
      sendToCopied: false,
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

    if (this.selectedMarket && Object.keys(this.selectedMarket).length > 0) {
      const toAsset = Object.keys(this.selectedMarket)[0]
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
      return !this.market || BN(this.min).gt(this.max)
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
    ...mapGetters(['client', 'accountItem', 'networkAccounts']),
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
      return this.selectedMarket?.[this.toAsset]
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
    selectedMarket () {
      return this.networkMarketData[this.asset]
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
      if (!this.market ||
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
      return BN(this.safeAmount).plus(this.fromSwapFee)
    },
    totalToSendInFiat () {
      const amount = this.stateSendAmount.plus(this.fromSwapFee)
      return cryptoToFiat(amount, this.fiatRates[this.assetChain]).toFormat(2)
    },
    receiveAmountSameAsset () {
      return BN(this.receiveAmount).minus(this.toSwapFee)
    },
    totalToReceiveInFiat () {
      const amount = this.stateReceiveAmount.plus(this.toSwapFee)
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
    async _updateSwapFees (amount) {
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

      if (this.availableFees.has(this.assetChain)) {
        const getMax = amount === undefined
        const fromTxTypes = this.getFeeTxTypes(this.assetChain)
        const assetFees = this.getAssetFees(this.assetChain)

        for (const txType of fromTxTypes) {
          if (txType === TX_TYPES.SWAP_INITIATION && this.assetChain === 'BTC') {
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
              const staticFee = getTxFee(this.asset, txType, fee.fee)
              fees[this.assetChain][speed] = fees[this.assetChain][speed].plus(staticFee)
            }
          }
        }
      }

      if (this.availableFees.has(this.toAssetChain)) {
        const toTxTypes = this.getFeeTxTypes(this.toAssetChain)
        const assetFees = this.getAssetFees(this.toAssetChain)
        for (const txType of toTxTypes) {
          for (const [speed, fee] of Object.entries(assetFees)) {
            const staticFee = getTxFee(this.toAsset, txType, fee.fee)
            fees[this.toAssetChain][speed] = fees[this.toAssetChain][speed].plus(staticFee)
          }
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
    async swap () {
      this.swapErrorMessage = ''
      this.swapErrorModalOpen = false
      this.loading = true
      if (this.account?.type.includes('ledger')) {
        this.signRequestModalOpen = true
      }
      try {
        const rawAmount = this.amountOption === 'max' ? this.max : this.safeAmount
        const fromAmount = currencyToUnit(cryptoassets[this.asset], rawAmount)

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
          agent: this.bestAgent,
          from: this.asset,
          to: this.toAsset,
          fromAmount,
          sendTo: this.sendTo,
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
    },
    max: function () {
      if (this.amountOption === 'max') {
        this.sendAmount = dpUI(this.max)
      }
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
