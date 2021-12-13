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
        <EthRequiredMessage :account-id="account.id" />
      </InfoNotification>

      <InfoNotification v-else-if="showNoLiquidityMessage && sendAmount >= min && sendAmount > 0">
        <NoLiquidityMessage :isPairAvailable="isPairAvailable" />
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
          <label class="d-flex align-items-center">
            Rate
            <SwapProviderLabel
              @click="showQuotesModal = true"
              v-if="selectedQuote"
              class="ml-2"
              :provider="selectedQuote.provider"
              :network="activeNetwork"
            />
            <a
              href="#"
              @click="showSwapProvidersInfoModal = true"
              class="ml-auto"
              id="swap_types_option"
              >Swap Types</a
            >
          </label>
          <p class="py-1">
            <span class="swap-rate_base">1 {{ asset }} =</span>
            <span class="swap-rate_value"> &nbsp;{{ quoteRate || "?" }} </span>
            <span class="swap-rate_term text-muted">&nbsp;{{ toAsset }}</span>
            <span v-if="updatingQuotes" class="swap-rate_loading ml-1"
              ><SpinnerIcon class="btn-loading" />
              <strong>Seeking Liquidity...</strong></span
            >
          </p>
          <p v-if="quotes.length > 1">
            <a id="see_all_quotes" href="#" @click="showQuotesModal = true"
              >See all {{ quotes.length }} quotes</a
            >
          </p>
        </div>

        <div
          class="form-group swap_fees mt-30"
          v-if="selectedQuote && availableFees.size"
        >
          <DetailsContainer>
            <template v-slot:header>
              <span class="details-title" id="network_speed_fee"
                >Network Speed/Fee</span
              >
              <span class="text-muted">
                {{ assetChain }}
                {{
                  assetChain ? getSelectedFeeLabel(selectedFee[assetChain]) : ""
                }}
              </span>
              <span
                class="text-muted"
                v-if="toAssetChain && assetChain != toAssetChain"
              >
                /{{ toAssetChain }}
                {{
                  toAssetChain
                    ? getSelectedFeeLabel(selectedFee[toAssetChain])
                    : ""
                }}
              </span>
            </template>
            <template v-slot:content>
              <ul class="selectors">
                <li v-for="assetFee in availableFees" :key="assetFee">
                  <span class="selectors-asset">{{ assetFee }}</span>
                  <div v-if="customFees[assetFee]">
                    {{ getTotalSwapFee(assetFee) }} {{ assetFee }} /
                    {{ getTotalSwapFeeInFiat(assetFee) }} USD
                    <button
                      class="btn btn-link"
                      @click="resetCustomFee(assetFee)"
                    >
                      Reset
                    </button>
                  </div>
                  <FeeSelector
                    v-else
                    :asset="assetsFeeSelector[assetFee]"
                    v-model="selectedFee[assetFee]"
                    :fees="getAssetFees(assetFee)"
                    :totalFees="
                      amountOption === 'max'
                        ? maxSwapFees[assetFee]
                        : swapFees[assetFee]
                    "
                    :fiatRates="fiatRates"
                    @custom-selected="onCustomFeeSelected"
                    :swap="true"
                  />
                </li>
              </ul>
            </template>
          </DetailsContainer>
        </div>
        <div class="wrapper_bottom">
          <SwapInfo v-if="selectedQuote" :quote="selectedQuote" />
          <div class="button-group">
            <router-link
              :to="
                routeSource === 'assets'
                  ? '/wallet'
                  : `/accounts/${this.account.id}/${this.asset}`
              "
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
        :totalFees="
          amountOption === 'max'
            ? maxSwapFees[customFeeAssetSelected]
            : swapFees[customFeeAssetSelected]
        "
        :fiatRates="fiatRates"
      />
    </div>
    <div class="swap" v-else-if="currentStep === 'confirm'">
      <NavBar :showBackButton="true" :backClick="back" backLabel="Back">
        Swap
      </NavBar>
      <div class="fee-wrapper" id="fees_are_high" v-if="isHighFee">
        Fees are high. Review transaction carefully.
      </div>
      <div class="fee-wrapper" id="swap_is_negative" v-if="isSwapNegative">
        Swap is negative. Review transaction carefully.
      </div>
      <div class="swap-confirm wrapper form">
        <div class="wrapper_top form">
          <div>
            <label class="mt-1">Send</label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div
                class="confirm-value"
                id="send_swap_confirm_value"
                :style="getAssetColorStyle(asset)"
              >
                {{ sendAmount }} {{ asset }}
              </div>
              <div class="details-text" id="send_swap_amount_fiat">
                {{ sendAmountFiat }}
              </div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted">Network Fee</label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div id="swap_send_network_fee_value">
                ~{{ fromSwapFee }} {{ assetChain }}
              </div>
              <div class="details-text" id="swap_send_network_fee_fiat_rate">
                ${{ prettyFiatBalance(fromSwapFee, fiatRates[assetChain]) }}
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
              <div
                class="font-weight-bold"
                id="swap_send_amount_fees_fiat_rate"
              >
                ${{ totalToSendInFiat }}
              </div>
            </div>
          </div>

          <div class="mt-20">
            <label>Receive</label>
            <div
              class="
                d-flex
                align-items-center
                justify-content-between
                my-0
                py-0
              "
            >
              <div
                class="confirm-value"
                id="receive_swap_confirm_value"
                :style="getAssetColorStyle(toAsset)"
              >
                {{ dpUI(receiveAmount) }} {{ toAsset }}
              </div>
              <div class="details-text" id="receive_swap_amount_fiat">
                {{ "$" + formatFiat(receiveAmountFiat) }}
              </div>
            </div>
          </div>
          <div class="detail-group" v-if="receiveFeeRequired">
            <label class="text-muted">Network Fee</label>
            <div
              class="
                d-flex
                align-items-center
                justify-content-between
                my-0
                py-0
              "
              id="swap_receive_network_fee_value"
            >
              <div>~{{ toSwapFee }} {{ toAssetChain }}</div>
              <div class="details-text" id="swap_receive_network_fee_fiat_rate">
                ${{ prettyFiatBalance(toSwapFee, fiatRates[toAssetChain]) }}
              </div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted">Amount - Fees</label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div class="font-weight-bold" id="swap_receive_amount_fee_value">
                <span v-if="toAsset === toAssetChain || !receiveFeeRequired">
                  {{ receiveAmountSameAsset }} {{ toAsset }}
                </span>
                <span v-else>
                  {{ receiveAmount }} {{ toAsset }} - {{ toSwapFee }}
                  {{ toAssetChain }}
                </span>
              </div>
              <div
                class="font-weight-bold"
                id="swap_receive_total_amount_in_fiat"
              >
                ${{ totalToReceiveInFiat }}
              </div>
            </div>
          </div>
          <div class="mt-20 swap-rate" id="swap_review_rate_block">
            <label
              class="d-flex align-items-center"
              id="selected_quote_provider_on_review"
            >
              Rate
              <SwapProviderLabel
                v-if="selectedQuote"
                class="ml-2"
                :provider="selectedQuote.provider"
                :network="activeNetwork"
              />
              <a
                href="#"
                @click="showSwapProvidersInfoModal = true"
                class="ml-auto"
                >Swap Types</a
              >
            </label>
            <p class="py-1" id="swap_rates_from_to">
              <span class="swap-rate_base">1 {{ asset }} =</span>
              <span class="swap-rate_value">
                &nbsp;{{ quoteRate || "?" }}
              </span>
              <span class="swap-rate_term text-muted">&nbsp;{{ toAsset }}</span>
            </p>
          </div>
        </div>
        <div class="wrapper_bottom">
          <SwapInfo :quote="selectedQuote" />
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
      <Accounts
        :exclude-asset="assetSelection === 'to' ? asset : toAsset"
        :asset-selection="assetSelection"
        @asset-selected="assetChanged"
      />
    </div>
    <!-- Swap types -->
    <SwapProvidersInfoModal
      v-if="showSwapProvidersInfoModal"
      @close="showSwapProvidersInfoModal = false"
    />
    <!-- Modals for quotes -->
    <QuotesModal
      v-if="showQuotesModal && selectedQuote"
      :quotes="quotes"
      :preset-provider="selectedQuote.provider"
      @select-quote="selectQuote"
      @close="showQuotesModal = false"
      @click-learn-more="
        showQuotesModal = false;
        showSwapProvidersInfoModal = true;
      "
    />
    <!-- Modals for ledger prompts -->
    <OperationErrorModal
      :open="swapErrorModalOpen"
      :account="account"
      @close="closeSwapErrorModal"
      :error="swapErrorMessage"
    />
    <LedgerSignRequestModal
      :open="signRequestModalOpen"
      @close="closeSignRequestModal"
    />
    <LedgerBridgeModal :open="bridgeModalOpen" @close="closeBridgeModal" />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import _ from 'lodash'
import BN from 'bignumber.js'
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
  formatFiat,
  VALUE_DECIMALS
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
import DetailsContainer from '@/components/DetailsContainer'
import SendInput from './SendInput'
import ReceiveInput from './ReceiveInput'
import Accounts from './Accounts'
import QuotesModal from './QuotesModal'
import SwapProvidersInfoModal from './SwapProvidersInfoModal'
import SwapInfo from './SwapInfo'
import SwapProviderLabel from '@/components/SwapProviderLabel'
import LedgerSignRequestModal from '@/components/LedgerSignRequestModal'
import OperationErrorModal from '@/components/OperationErrorModal'
import CustomFees from '@/components/CustomFees'
import { SwapProviderType, getSwapProviderConfig } from '@/utils/swaps'
import { calculateQuoteRate, sortQuotes } from '@/utils/quotes'
import LedgerBridgeModal from '@/components/LedgerBridgeModal'
import { BG_PREFIX } from '@/broker/utils'
import buildConfig from '@/build.config'

const DEFAULT_SWAP_VALUE_USD = 100
const QUOTE_TIMER_MS = 30000
const MIN_SWAP_VALUE_USD = 2

export default {
  components: {
    NavBar,
    InfoNotification,
    EthRequiredMessage,
    NoLiquidityMessage,
    FeeSelector,
    SwapIcon,
    SpinnerIcon,
    DetailsContainer,
    SendInput,
    ReceiveInput,
    Accounts,
    SwapProviderLabel,
    LedgerSignRequestModal,
    OperationErrorModal,
    CustomFees,
    LedgerBridgeModal,
    QuotesModal,
    SwapProvidersInfoModal,
    SwapInfo
  },
  data () {
    return {
      stateSendAmount: 0,
      stateSendAmountFiat: 0,
      amountOption: null,
      asset: null,
      toAsset: null,
      showQuotesModal: false,
      showSwapProvidersInfoModal: false,
      quotes: [],
      updatingQuotes: false,
      selectedQuote: null,
      userSelectedQuote: false,
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
      bridgeModalOpen: false
    }
  },
  props: {
    routeAsset: String,
    accountId: String
  },
  created () {
    this.asset = this.routeAsset
    this.fromAccountId = this.accountId
    this.updateMarketData({ network: this.activeNetwork });
    (async () => {
      await this.updateFees({ asset: this.assetChain })
      await this.updateMaxSwapFees()
    })()

    // Try to use the same account for (from and to) if it has more than one asset
    let toAsset = null
    if (
      this.account?.assets.length > 0 &&
      !this.account?.assets.includes(this.asset)
    ) {
      this.toAccountId = this.accountId
      toAsset = this.account?.assets.find((a) => a !== this.asset)
    } else {
      if (this.networkAccounts.length > 0) {
        const toAccount = this.networkAccounts.find(
          (account) =>
            account.assets &&
            !account.assets.includes(this.asset) &&
            account.id !== this.accountId
        )
        if (toAccount) {
          this.toAccountId = toAccount.id
          toAsset = toAccount.assets.find((a) => a !== this.asset)
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

    this.sendAmount = dpUI(this.defaultAmount)

    this.resetQuoteTimer()
    this.trackNoLiquidity()
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
      return (
        (!this.selectedQuote || BN(this.min).gt(this.max)) &&
        !this.updatingQuotes
      )
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
        return this.stateSendAmountFiat
      },
      set (newValue) {
        const value = (newValue || '0').replace('$', '')
        this.stateSendAmountFiat = value
        this.stateSendAmount = fiatToCrypto(value, this.fiatRates[this.asset])
      }
    },
    receiveAmount () {
      return this.selectedQuote
        ? unitToCurrency(
          cryptoassets[this.toAsset],
          this.selectedQuote.toAmount
        )
        : BN(0)
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
    ...mapGetters('app', ['ledgerBridgeReady']),
    ...mapGetters(['client', 'swapProvider', 'accountItem', 'networkAccounts']),
    networkMarketData () {
      return this.marketData[this.activeNetwork]
    },
    networkWalletBalances () {
      return this.account?.balances
    },
    quoteRate () {
      if (!this.selectedQuote) return null
      const rate = calculateQuoteRate(this.selectedQuote)
      return dpUI(rate)
    },
    bestQuote () {
      const sortedQuotes = sortQuotes(this.quotes, this.activeNetwork)
      return sortedQuotes[0]
    },
    selectedQuoteProvider () {
      if (!this.selectedQuote) return null
      return this.swapProvider(this.activeNetwork, this.selectedQuote.provider)
    },
    defaultAmount () {
      const min = BN(this.min)
      if (!min.eq(0)) {
        return BN(min)
      } else if (this.fiatRates[this.asset]) {
        return BN.min(
          fiatToCrypto(DEFAULT_SWAP_VALUE_USD, this.fiatRates[this.asset]),
          this.available
        )
      } else {
        return BN(0)
      }
    },
    isPairAvailable () {
      const liqualityMarket = this.networkMarketData?.find(
        (pair) =>
          pair.from === this.asset &&
          (pair.to === this.toAsset ||
            buildConfig.supportedBridgeAssets.indexOf(this.toAssetChain) !== -1)
      )
      return !!liqualityMarket
    },
    min () {
      const toQuoteAsset = this.selectedQuoteProvider?.config?.type === SwapProviderType.LIQUALITYBOOST ? this.toAssetChain : this.toAsset
      const liqualityMarket = this.networkMarketData?.find(pair =>
        pair.from === this.asset &&
        pair.to === toQuoteAsset &&
        getSwapProviderConfig(this.activeNetwork, pair.provider).type === SwapProviderType.LIQUALITY)
      const min = liqualityMarket ? BN(liqualityMarket.min) : BN.min(fiatToCrypto(MIN_SWAP_VALUE_USD, this.fiatRates[this.asset]), this.available)
      return isNaN(min) ? BN(0) : dpUI(min)
    },
    max () {
      return this.available && !isNaN(this.available)
        ? BN.min(BN(this.available))
        : BN(0)
    },
    safeAmount () {
      return this.sendAmount || 0
    },
    fromSwapFee () {
      const selectedSpeed = this.selectedFee[this.assetChain]
      const fee =
        this.amountOption === 'max'
          ? this.maxSwapFees[this.assetChain]?.[selectedSpeed]
          : this.swapFees[this.assetChain]?.[selectedSpeed]
      return fee || BN(0)
    },
    toSwapFee () {
      if (!this.receiveFeeRequired) return BN(0)
      const selectedSpeed = this.selectedFee[this.toAssetChain]
      const fee =
        this.amountOption === 'max'
          ? this.maxSwapFees[this.toAssetChain]?.[selectedSpeed]
          : this.swapFees[this.toAssetChain]?.[selectedSpeed]
      return fee || BN(0)
    },
    maxFee () {
      const selectedSpeed = this.selectedFee[this.assetChain]
      const fee = this.maxSwapFees[this.assetChain]?.[selectedSpeed]
      return fee ? currencyToUnit(cryptoassets[this.assetChain], fee) : BN(0)
    },
    receiveFeeRequired () {
      return this.selectedQuoteProvider.toTxType
    },
    available () {
      if (!this.networkWalletBalances) return BN(0)
      const balance = this.networkWalletBalances[this.asset]
      const available = isERC20(this.asset)
        ? BN(balance)
        : BN.max(BN(balance).minus(this.maxFee), 0)
      return unitToCurrency(cryptoassets[this.asset], available)
    },
    availableAmount () {
      return dpUI(this.available, VALUE_DECIMALS)
    },
    ethRequired () {
      if (this.assetChain === 'ETH') {
        return (
          !this.account?.balances?.ETH || this.account?.balances?.ETH === 0
        )
      }

      if (this.toAssetChain === 'ETH') {
        return (
          !this.toAccount?.balances?.ETH || this.toAccount?.balances?.ETH === 0
        )
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

      if (amount.lt(this.min) || amount.lte(0)) {
        return 'Please increase amount. It is below minimum.'
      }

      return null
    },
    canSwap () {
      if (
        !this.selectedQuote ||
        this.updatingQuotes ||
        this.ethRequired ||
        this.showNoLiquidityMessage ||
        this.amountError ||
        BN(this.safeAmount).lte(0)
      ) {
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
    sendAmountSameAsset () {
      return BN(this.safeAmount).plus(this.fromSwapFee)
    },
    totalToSendInFiat () {
      const send = cryptoToFiat(
        BN(this.stateSendAmount),
        this.fiatRates[this.asset]
      )
      const fee = cryptoToFiat(
        this.fromSwapFee,
        this.fiatRates[this.assetChain]
      )
      return send.plus(fee).toFormat(2)
    },
    receiveAmountSameAsset () {
      return BN(this.receiveAmount).minus(this.toSwapFee)
    },
    totalToReceiveInFiat () {
      const receive = cryptoToFiat(
        this.receiveAmount,
        this.fiatRates[this.toAsset]
      )
      const fee = cryptoToFiat(
        this.toSwapFee,
        this.fiatRates[this.toAssetChain]
      )
      return receive.minus(fee).toFormat(2)
    },
    assetsFeeSelector () {
      return {
        [this.assetChain]: this.asset,
        [this.toAssetChain]: this.toAsset
      }
    },
    isHighFee () {
      const feeTotal = cryptoToFiat(
        this.toSwapFee,
        this.fiatRates[this.assetChain]
      ).plus(cryptoToFiat(this.fromSwapFee, this.fiatRates[this.assetChain]))
      const receiveTotalPercentage = this.totalToReceiveInFiat * 0.25
      return feeTotal.gte(BN(receiveTotalPercentage))
    },
    isSwapNegative () {
      return this.totalToReceiveInFiat <= 0
    }
  },
  methods: {
    ...mapActions([
      'updateMarketData',
      'getQuotes',
      'updateFees',
      'newSwap',
      'updateFiatRates',
      'trackAnalytics'
    ]),
    ...mapActions('app', ['startBridgeListener']),
    shortenAddress,
    dpUI,
    prettyBalance,
    prettyFiatBalance,
    getAssetIcon,
    getAssetColorStyle,
    formatFiat,
    getAssetFees (asset) {
      const assetFees = {}
      if (this.customFees[asset]) {
        assetFees.custom = { fee: this.customFees[asset] }
      }

      const fees =
        this.fees[this.activeNetwork]?.[this.activeWalletId]?.[asset]
      if (fees) {
        Object.assign(assetFees, fees)
      }

      return assetFees
    },
    setSendAmount (amount) {
      this.sendAmount = amount
      if (amount === this.max) {
        this.amountOption = 'max'
      } else if (amount === this.min) {
        this.amountOption = 'min'
      }
    },
    setToAsset (toAsset) {
      this.toAsset = toAsset
      if (this.amountOption === 'max') {
        this.sendAmount = this.max
      } else if (this.amountOption === 'min') {
        this.sendAmount = this.min
      } else {
        this.sendAmount = dpUI(this.defaultAmount)
      }

      this.resetFees()
      this.updateQuotes()
      this.updateFiatRates({ assets: [toAsset] })
      this.trackAnalytics({
        event: 'Swap screen',
        properties: {
          category: 'Swap screen',
          action: 'User on SWAP screen',
          label: `${this.toAsset}`
        }
      })
    },
    setFromAsset (asset) {
      this.asset = asset
      this.sendAmount = dpUI(this.defaultAmount)
      this.resetFees()
      this.updateQuotes()
      this.updateFiatRates({ assets: [asset] })
    },
    async _updateSwapFees (max) {
      if (!this.selectedQuote) return
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

      const selectedQuoteProvider = this.selectedQuoteProvider
      const { fromTxType, toTxType } = selectedQuoteProvider

      const addFees = async (asset, chain, txType) => {
        const assetFees = this.getAssetFees(chain)
        const totalFees = await selectedQuoteProvider.estimateFees({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          asset,
          txType,
          quote: this.selectedQuote,
          feePrices: Object.values(assetFees).map((fee) => fee.fee),
          max
        })

        if (!totalFees) return

        for (const [speed, fee] of Object.entries(assetFees)) {
          fees[chain][speed] = fees[chain][speed].plus(totalFees[fee.fee])
        }
      }

      if (fromTxType && this.availableFees.has(this.assetChain)) {
        await addFees(this.asset, this.assetChain, fromTxType)
      }

      if (toTxType && this.availableFees.has(this.toAssetChain)) {
        await addFees(this.toAsset, this.toAssetChain, toTxType)
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
        (async () => {
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
      if (this.account?.type.includes('ledger') && !this.ledgerBridgeReady) {
        this.loading = true
        this.bridgeModalOpen = true
        await this.startBridgeListener()
        const unsubscribe = this.$store.subscribe(async ({ type, payload }) => {
          if (
            type === `${BG_PREFIX}app/SET_USB_BRIDGE_TRANSPORT_CREATED` &&
            payload.connected === true
          ) {
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
    resetQuoteTimer () {
      clearTimeout(this.quoteTimer)
      this.quoteTimer = setTimeout(() => {
        this.updateQuotes()
      }, QUOTE_TIMER_MS)
    },
    _updateQuotes: _.debounce(async function () {
      const quotes = await this.getQuotes({
        network: this.activeNetwork,
        from: this.asset,
        to: this.toAsset,
        fromAccountId: this.fromAccountId,
        toAccountId: this.toAccountId,
        amount: BN(this.sendAmount)
      })
      if (
        quotes.every(
          (quote) => quote.from === this.asset && quote.to === this.toAsset
        )
      ) {
        this.quotes = quotes
        if (this.selectedQuote) {
          // Preserve selected provider
          if (this.userSelectedQuote) {
            const matchingQuote = this.quotes.find(
              (q) => q.provider === this.selectedQuote.provider
            )
            this.selectedQuote = matchingQuote || this.bestQuote
          } else {
            this.userSelectedQuote = false
            this.selectedQuote = this.bestQuote
          }
        } else {
          this.selectedQuote = this.bestQuote
        }
      }
      this.updatingQuotes = false
      this.resetQuoteTimer()
    }, 1000),
    updateQuotes () {
      if (BN(this.sendAmount).eq(0)) return // Don't update quote when amount 0
      if (this.currentStep !== 'inputs') return // Don't update quote when in review
      this.quotes = []
      this.updatingQuotes = true
      this._updateQuotes()
    },
    selectQuote (provider) {
      const matchingQuote = this.quotes.find((q) => q.provider === provider)
      this.selectedQuote = matchingQuote
      this.userSelectedQuote = true
      this.showQuotesModal = false
    },
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

        const toFee =
          this.receiveFeeRequired && this.availableFees.has(this.toAssetChain)
            ? this.getAssetFees(this.toAssetChain)[
              this.selectedFee[this.toAssetChain]
            ].fee
            : undefined

        await this.newSwap({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          quote: this.selectedQuote,
          fee,
          claimFee: toFee,
          feeLabel: this.selectedFee[this.assetChain],
          claimFeeLabel: this.selectedFee[this.toAssetChain]
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

      this.trackNoLiquidity()
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
      const presetFee = Object.entries(assetFees).find(
        ([speed, speedFee]) => speed !== 'custom' && speedFee.fee === fee
      )
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
    },
    trackNoLiquidity () {
      if (this.showNoLiquidityMessage) {
        this.trackAnalytics({
          event: 'No Liquidity',
          properties: {
            category: 'Swap screen',
            action: 'No Liquidity for pairs',
            label: `from ${this.asset} to ${this.toAsset}`
          }
        })
      }
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
    selectedQuote: function () {
      this._updateSwapFees() // Skip debounce
      this.updateMaxSwapFees()
    },
    currentStep: function (val) {
      if (val === 'inputs') this.updateQuotes()
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

.fee-wrapper {
  background-color: #f0f7f9;
  align-self: center;
  padding-left: 20px;
  padding-top: 3px;
  padding-bottom: 3px;
  position: absolute;
  width: 100%;
}

.swap-rate {
  p {
    margin-bottom: 0;
  }

  &_loading {
    svg {
      height: 16px;
    }
  }

  &_value {
    font-weight: bold;
  }

  a {
    text-transform: none;
    font-weight: normal;
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
