<template>
  <div class="view-container">
    <div class="swap" v-if="currentStep === 'inputs'">
      <NavBar
        showBack="true"
        :backPath="routeSource === 'assets' ? '/wallet' : `/accounts/${account.id}/${asset}`"
        :backLabel="$t('common.back')"
      >
        {{ $t('common.swap') }}
      </NavBar>
      <InfoNotification
        v-if="showNoLiquidityMessage && !updatingQuotes && sendAmount >= min && sendAmount > 0"
      >
        <NoLiquidityMessage :isPairAvailable="isPairAvailable" :asset="toAsset" />
      </InfoNotification>
      <InfoNotification v-else-if="showBridgeAssetDisabledMessage">
        <BoostActivateBridgeAsset
          :network="activeNetwork"
          :walletId="activeWalletId"
          :asset="selectedQuote.bridgeAsset"
          :updateQuotes="updateQuotes"
        />
      </InfoNotification>
      <InfoNotification v-else-if="showNativeAssetDisabledMessage">
        <BoostActivateBridgeAsset
          :network="activeNetwork"
          :walletId="activeWalletId"
          :asset="assetChain"
          :updateQuotes="updateQuotes"
        />
      </InfoNotification>
      <InfoNotification
        v-else-if="
          cannotCoverNetworkFee && sendAmount >= min && sendAmount > 0 && !insufficientFundsError
        "
      >
        <NoFundsForNetworkFee
          :account-id="account.id"
          :assetChain="assetChain"
          :receiveFeeProblem="false"
          :toAssetChain="toAssetChain"
        />
      </InfoNotification>
      <InfoNotification
        v-else-if="
          cannotCoverReceiveFee && sendAmount >= min && sendAmount > 0 && !insufficientFundsError
        "
      >
        <NoFundsForNetworkFee
          :account-id="account.id"
          :assetChain="assetChain"
          :receiveFeeProblem="true"
          :toAssetChain="toAssetChain"
        />
      </InfoNotification>
      <InfoNotification v-else-if="!canCoverAmmFee && !insufficientFundsError">
        <BridgeAssetRequiredMessage
          :account-id="getAccountId()"
          :asset="selectedQuote.bridgeAsset"
        />
      </InfoNotification>
      <InfoNotification v-else-if="ethRequired && !insufficientFundsError">
        <EthRequiredMessage :account-id="account.id" :action="'swap'" />
      </InfoNotification>
      <InfoNotification v-else-if="cannotCoverMinimum && !insufficientFundsError">
        <CannotCoverMinimumMessage :asset="asset" :account-id="account.id" />
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
          <div class="arrow-down">
            <ArrowDown
              id="arrow"
              v-if="!updatingQuotes"
              @click="onReverseAssets(asset, toAsset, selectedQuote, fromAccountId, toAccountId)"
            />
            <SpinnerIcon v-else />
          </div>
          <ReceiveInput
            class="mt-30"
            :account="toAccount"
            :to-asset="toAsset"
            :receive-amount="dpUI(receiveAmount)"
            :receive-amount-fiat="dpUI(receiveAmountFiat, 2)"
            disabled
            @to-asset-click="toAssetClick"
          />
        </div>
        <div class="mt-30 form-group swap-rate" id="rate_block">
          <label class="d-flex align-items-center">
            {{ $t('common.rate') }}
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
              >{{ $t('pages.swap.swapTypes') }}</a
            >
          </label>
          <p class="py-1">
            <span class="swap-rate_base">1 {{ asset }} =</span>
            <span class="swap-rate_value"> &nbsp;{{ quoteRate || '?' }} </span>
            <span class="swap-rate_term text-muted">&nbsp;{{ toAsset }}</span>
            <span v-if="updatingQuotes" class="swap-rate_loading ml-1"
              ><SpinnerIcon class="btn-loading" />
              <strong>{{ $t('pages.swap.seekingLiquidity') }}</strong></span
            >
          </p>
          <p v-if="quotes.length > 1">
            <a id="see_all_quotes" href="#" @click="showQuotesModal = true">
              {{ $t('pages.swap.seeAllQuotes', { count: quotes.length }) }}
            </a>
          </p>
        </div>

        <div class="form-group swap_fees mt-30" v-if="selectedQuote && availableFees.size">
          <DetailsContainer>
            <template v-slot:header>
              <div class="network-header-container">
                <span class="details-title" id="network_speed_fee">
                  {{ $t('common.networkSpeedFee') }}
                </span>
              </div>
            </template>
            <template v-slot:content>
              <ul class="selectors">
                <li v-for="(assetFee, idx) in availableFees" :key="assetFee">
                  <span class="selectors-asset">{{ assetFee }}</span>
                  <div v-if="customFees[assetFee]" class="selector-asset-switch">
                    <span v-if="getTotalSwapFee(assetFee).dp(6).eq(0)"
                      >{{ dpUI(getChainAssetSwapFee(assetFee)) }}
                    </span>
                    <span v-else>{{ getTotalSwapFee(assetFee).dp(6) }} {{ assetFee }}</span> /
                    {{ getTotalSwapFeeInFiat(assetFee) }} USD
                    <button class="btn btn-link" @click="resetCustomFee(assetFee)">Reset</button>
                  </div>
                  <div v-else>
                    <FeeSelector
                      v-if="
                        (idx === 0 && isFromCustomFeeSupported) ||
                        (idx === 1 && isToCustomFeeSupported)
                      "
                      :asset="assetsFeeSelector[assetFee]"
                      v-model="selectedFee[assetFee]"
                      :fees="getAssetFees(assetFee)"
                      :totalFees="
                        amountOption === 'max' ? maxSwapFees[assetFee] : swapFees[assetFee]
                      "
                      :fiatRates="fiatRates"
                      @custom-selected="onCustomFeeSelected"
                      :swap="true"
                    />
                    <div
                      v-else-if="
                        (idx === 0 && !isFromCustomFeeSupported) ||
                        (idx === 1 && !isToCustomFeeSupported)
                      "
                      class="network-header-container"
                    >
                      <span class="text-muted" id="send_network_speed_avg_fee">
                        ({{ swapFees[assetFee].slow }} {{ assetFee }})
                      </span>
                    </div>
                  </div>
                </li>
                <li v-if="hasPredefinedReceiveFee">
                  <span class="selectors-asset">{{ toAsset }} </span>{{ dpUI(receiveFee) }} /
                  {{ getTotalSwapFeeInFiat(toAsset) }} USD
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
                routeSource === 'assets' ? '/wallet' : `/accounts/${this.account.id}/${this.asset}`
              "
            >
              <button class="btn btn-light btn-outline-primary btn-lg">
                {{ $t('common.cancel') }}
              </button>
            </router-link>
            <button
              class="btn btn-primary btn-lg"
              id="swap_review_button"
              @click="review"
              :disabled="!canSwap || cannotCoverNetworkFee"
            >
              {{
                !canSwap || cannotCoverNetworkFee
                  ? $t('pages.swap.insufficientFunds')
                  : $t('common.review')
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="swap" v-else-if="currentStep === 'custom-fees' && !isEIP1559Fees">
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
    <div class="swap" v-else-if="currentStep === 'custom-fees' && isEIP1559Fees">
      <CustomFeesEIP1559
        @apply="applyCustomFee"
        @update="setCustomFee"
        @cancel="cancelCustomFee"
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
      <NavBar :showBackButton="true" :backClick="back" :backLabel="$t('common.back')"> Swap</NavBar>
      <div class="fee-wrapper" id="swap_is_negative" v-if="isSwapNegative">
        Fees are extreme. Review transaction carefully.
      </div>
      <div class="fee-wrapper" id="fees_are_high" v-else-if="isHighFee">
        Fees are high. Review transaction carefully.
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
                {{ formatFiatUI(sendAmountFiat) }}
              </div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted">Network Fee</label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div id="swap_send_network_fee_value">~{{ dpUI(fromSwapFee) }} {{ assetChain }}</div>
              <div
                v-if="isSwapNegative"
                class="extreme-fee-text details-text"
                id="swap_send_network_fee_fiat_rate"
              >
                {{ formatFiatUI(prettyFiatBalance(fromSwapFee, fiatRates[assetChain])) }}
              </div>
              <div
                v-else-if="isHighFee"
                class="high-fee-text details-text"
                id="swap_send_network_fee_fiat_rate"
              >
                {{ formatFiatUI(prettyFiatBalance(fromSwapFee, fiatRates[assetChain])) }}
              </div>
              <div v-else class="details-text" id="swap_send_network_fee_fiat_rate">
                {{ formatFiatUI(prettyFiatBalance(fromSwapFee, fiatRates[assetChain])) }}
              </div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted">{{ $t('common.amountPlusFees') }}</label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div class="font-bold" id="swap_send_amount_fees_value">
                <span v-if="asset === assetChain">
                  {{ dpUI(sendAmountSameAsset) }} {{ assetChain }}
                </span>
                <span v-else>
                  {{ dpUI(sendAmount) }} {{ asset }} + {{ dpUI(fromSwapFee) }}
                  {{ assetChain }}
                </span>
              </div>
              <div class="font-bold" id="swap_send_amount_fees_fiat_rate">
                {{ formatFiatUI(totalToSendInFiat) }}
              </div>
            </div>
          </div>

          <div class="mt-20">
            <label>{{ $t('common.receive') }}</label>
            <div class="d-flex align-items-center justify-content-between my-0 py-0">
              <div
                class="confirm-value"
                id="receive_swap_confirm_value"
                :style="getAssetColorStyle(toAsset)"
              >
                {{ dpUI(receiveAmount) }} {{ toAsset }}
              </div>
              <div class="details-text" id="receive_swap_amount_fiat">
                {{ formatFiatUI(formatFiat(receiveAmountFiat)) }}
              </div>
            </div>
          </div>
          <div class="detail-group" v-if="receiveFeeRequired || hasPredefinedReceiveFee">
            <label class="text-muted">{{
              hasPredefinedReceiveFee ? $t('common.receiveFee') : $t('common.networkFee')
            }}</label>
            <div
              class="d-flex align-items-center justify-content-between my-0 py-0"
              id="swap_receive_network_fee_value"
            >
              <div>
                ~{{ dpUI(receiveFee) }} {{ hasPredefinedReceiveFee ? toAsset : toAssetChain }}
              </div>
              <div
                v-if="isSwapNegative"
                class="extreme-fee-text details-text"
                id="swap_receive_network_fee_fiat_rate"
              >
                {{
                  formatFiatUI(
                    prettyFiatBalance(
                      receiveFee,
                      fiatRates[hasPredefinedReceiveFee ? toAsset : toAssetChain]
                    )
                  )
                }}
              </div>
              <div
                v-else-if="isHighFee"
                class="high-fee-text details-text"
                id="swap_receive_network_fee_fiat_rate"
              >
                {{
                  formatFiatUI(
                    prettyFiatBalance(
                      receiveFee,
                      fiatRates[hasPredefinedReceiveFee ? toAsset : toAssetChain]
                    )
                  )
                }}
              </div>
              <div v-else class="details-text" id="swap_receive_network_fee_fiat_rate">
                {{
                  formatFiatUI(
                    prettyFiatBalance(
                      receiveFee,
                      fiatRates[hasPredefinedReceiveFee ? toAsset : toAssetChain]
                    )
                  )
                }}
              </div>
            </div>
          </div>
          <div class="detail-group">
            <label class="text-muted">{{ $t('pages.swap.amountMinusFees') }}</label>
            <div class="d-flex align-items-center justify-content-between mt-0">
              <div class="font-bold" id="swap_receive_amount_fee_value">
                <span v-if="toAsset === toAssetChain || !receiveFeeRequired">
                  {{ dpUI(receiveAmountSameAsset) }} {{ toAsset }}
                </span>
                <span v-else>
                  {{ dpUI(receiveAmount) }} {{ toAsset }} - {{ dpUI(receiveFee) }}
                  {{ hasPredefinedReceiveFee ? toAsset : toAssetChain }}
                </span>
              </div>
              <div
                :class="!isSwapNegative ? 'font-bold' : 'extreme-fee-text font-bold'"
                id="swap_receive_total_amount_in_fiat"
              >
                {{ formatFiatUI(totalToReceiveInFiat) }}
              </div>
            </div>
          </div>
          <div class="mt-20 swap-rate" id="swap_review_rate_block">
            <label class="d-flex align-items-center" id="selected_quote_provider_on_review">
              {{ $t('common.rate') }}
              <SwapProviderLabel
                v-if="selectedQuote"
                class="ml-2"
                :provider="selectedQuote.provider"
                :network="activeNetwork"
              />
              <a href="#" @click="showSwapProvidersInfoModal = true" class="ml-auto">
                {{ $t('pages.swap.swapTypes') }}
              </a>
            </label>
            <p class="py-1" id="swap_rates_from_to">
              <span class="swap-rate_base">1 {{ asset }} =</span>
              <span class="swap-rate_value"> &nbsp;{{ quoteRate || '?' }} </span>
              <span class="swap-rate_term text-muted">&nbsp;{{ toAsset }}</span>
            </p>
          </div>
        </div>
        <div class="wrapper_bottom">
          <SwapInfo v-if="selectedQuote" :quote="selectedQuote" />
          <div class="button-group">
            <button
              class="btn btn-light btn-outline-primary btn-lg"
              id="edit_swap_button"
              v-if="!loading"
              @click="currentStep = 'inputs'"
            >
              {{ $t('common.edit') }}
            </button>
            <button
              class="btn btn-primary btn-lg btn-block btn-icon"
              id="initiate_swap_button"
              @click.stop="swap"
              :disabled="loading"
            >
              <SpinnerIcon class="btn-loading" v-if="loading" />
              <template v-else>
                <SwapIcon />
                {{ $t('pages.swap.initiateSwap') }}
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="swap" v-else>
      <NavBar :showBackButton="true" :backClick="back" :backLabel="$t('common.back')">
        {{ $t('common.selectAsset') }}
      </NavBar>
      <Accounts
        :exclude-asset="assetSelection === 'to' ? asset : toAsset"
        :asset-selection="assetSelection"
        @asset-selected="assetChanged"
        :account="account"
        :to-account="toAccount"
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
        showQuotesModal = false
        showSwapProvidersInfoModal = true
      "
    />
    <!-- Modals for ledger prompts -->
    <OperationErrorModal
      :open="swapErrorModalOpen"
      :account="account"
      @close="closeSwapErrorModal"
      :liqualityErrorString="swapErrorMessage"
    />
    <LedgerSignRequestModal :open="signRequestModalOpen" @close="closeSignRequestModal" />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import _ from 'lodash'
import BN from 'bignumber.js'
import cryptoassets from '@liquality/wallet-core/dist/src/utils/cryptoassets'
import { currencyToUnit, unitToCurrency, getChain } from '@liquality/cryptoassets'
import FeeSelector from '@/components/FeeSelector'
import NavBar from '@/components/NavBar'
import InfoNotification from '@/components/InfoNotification'
import EthRequiredMessage from '@/components/EthRequiredMessage'
import BridgeAssetRequiredMessage from '@/components/BridgeAssetRequiredMessage'
import CannotCoverMinimumMessage from '@/components/CannotCoverMinimumMessage'
import NoFundsForNetworkFee from '@/components/NoFundsForNetworkFee'
import BoostActivateBridgeAsset from '@/components/BoostActivateBridgeAsset'
import NoLiquidityMessage from '@/components/NoLiquidityMessage'
import {
  cryptoToFiat,
  dpUI,
  fiatToCrypto,
  formatFiat,
  formatFiatUI,
  prettyBalance,
  prettyFiatBalance,
  VALUE_DECIMALS
} from '@liquality/wallet-core/dist/src/utils/coinFormatter'
import {
  getAssetColorStyle,
  getNativeAsset,
  isERC20
} from '@liquality/wallet-core/dist/src/utils/asset'
import { getAssetIcon } from '@/utils/asset'
import { shortenAddress } from '@liquality/wallet-core/dist/src/utils/address'
import {
  getFeeLabel,
  isEIP1559Fees,
  feePerUnit,
  newSendFees
} from '@liquality/wallet-core/dist/src/utils/fees'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ArrowDown from '@/assets/icons/arrow-down.svg'
import DetailsContainer from '@/components/DetailsContainer'
import SendInput from './SendInput'
import ReceiveInput from './ReceiveInput'
import QuotesModal from './QuotesModal'
import SwapProvidersInfoModal from './SwapProvidersInfoModal'
import SwapInfo from './SwapInfo'
import Accounts from './Accounts'
import SwapProviderLabel from '@/components/SwapProviderLabel'
import LedgerSignRequestModal from '@/components/LedgerSignRequestModal'
import OperationErrorModal from '@/components/OperationErrorModal'
import CustomFees from '@/components/CustomFees'
import CustomFeesEIP1559 from '@/components/CustomFeesEIP1559'
import { calculateQuoteRate, sortQuotes } from '@liquality/wallet-core/dist/src/utils/quotes'
import { version as walletVersion } from '../../../package.json'
import { buildConfig } from '@liquality/wallet-core'
import { SwapProviderType } from '@liquality/wallet-core/dist/src/store/types'
import { getSwapProvider } from '@liquality/wallet-core/dist/src/factory'
import qs from 'qs'
import { errorToLiqualityErrorString } from '@liquality/error-parser/dist/src/utils'
import { reportLiqualityError } from '@liquality/error-parser/dist/src/reporters/index'

const QUOTE_TIMER_MS = 30000

export default {
  components: {
    NavBar,
    InfoNotification,
    EthRequiredMessage,
    BridgeAssetRequiredMessage,
    BoostActivateBridgeAsset,
    CannotCoverMinimumMessage,
    NoFundsForNetworkFee,
    NoLiquidityMessage,
    FeeSelector,
    SwapIcon,
    SpinnerIcon,
    ArrowDown,
    DetailsContainer,
    SendInput,
    ReceiveInput,
    Accounts,
    SwapProviderLabel,
    LedgerSignRequestModal,
    OperationErrorModal,
    CustomFees,
    CustomFeesEIP1559,
    QuotesModal,
    SwapProvidersInfoModal,
    SwapInfo
  },
  data() {
    return {
      stateSendAmount: 0.0,
      stateSendAmountFiat: 0.0,
      amountOption: null,
      asset: null,
      toAsset: null,
      showQuotesModal: false,
      showSwapProvidersInfoModal: false,
      cannotCoverMinimum: false,
      minSwapAmount: 0,
      quotes: [],
      updatingQuotes: false,
      selectedQuote: null,
      userSelectedQuote: false,
      swapFees: {},
      maxSwapFees: {},
      selectedFee: {},
      selectedFromFee: 'fast',
      selectedToFee: 'fast',
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
  async created() {
    this.asset = this.routeAsset
    this.fromAccountId = this.accountId

    if (this.$route.query.mode === 'tab') {
      const swapParams = qs.parse(qs.stringify(this.$route.query))
      const {
        selectedFee,
        sendAmount,
        toAccountId,
        customFees,
        userSelectedQuote,
        toAsset,
        currentStep,
        maxOptionActive,
        selectedQuote
      } = swapParams

      this.toAsset = toAsset
      this.sendAmount = sendAmount
      this.currentStep = currentStep
      this.maxOptionActive = maxOptionActive
      this.toAccountId = toAccountId
      this.selectedFee = selectedFee
      this.customFees = customFees || {}
      this.selectedQuote = selectedQuote
      this.userSelectedQuote = userSelectedQuote

      await this._updateQuotes()
    } else {
      this.selectedFee = {
        [this.assetChain]: 'fast',
        [this.toAssetChain]: 'fast'
      }
      this.sendAmount = dpUI(this.defaultAmount)
      // Try to use the same account for (from and to) if it has more than one asset
      if (this.account?.assets.length > 1) {
        this.toAccountId = this.accountId
        this.toAsset = this.account?.assets.find((a) => a !== this.asset)
      } else {
        // use another account
        if (this.accountsData.length > 0) {
          const toAccount = this.accountsData.find((account) => {
            const assetAvailable =
              account.assets?.length > 0 && account.assets?.includes(this.asset)
            const idsMatching = account.id == this.accountId
            return !assetAvailable && !idsMatching
          })
          if (toAccount) {
            this.toAccountId = toAccount.id
            this.toAsset = toAccount.assets[0]
          }
        }
      }
    }

    if (this.toAccountId && this.toAsset) {
      this.toAssetChanged(this.toAccountId, this.toAsset)
      this.updateFees({ asset: this.toAsset })
      this.selectedFee = {
        [this.assetChain]: this.selectedFromFee,
        [this.toAssetChain]: this.selectedToFee
      }
    }

    this.fee = this.fees[this.selectedFromFee]?.fee
    this.updateFiatRates({ assets: [this.toAsset, this.asset] })
    this.updateMarketData({ network: this.activeNetwork })
    ;(async () => {
      await this.updateFees({ asset: this.assetChain })
      await this.updateMaxSwapFees()
    })()

    this.resetQuoteTimer(QUOTE_TIMER_MS)
    this.trackNoLiquidity()
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  computed: {
    isFromCustomFeeSupported() {
      const { supportCustomFees } = getChain(this.activeNetwork, cryptoassets[this.asset].chain)
      return supportCustomFees
    },
    isToCustomFeeSupported() {
      const { supportCustomFees } = getChain(this.activeNetwork, cryptoassets[this.toAsset].chain)
      return supportCustomFees
    },
    account() {
      return this.accountItem(this.fromAccountId)
    },
    toAccount() {
      return this.toAccountId ? this.accountItem(this.toAccountId) : null
    },
    routeSource() {
      return this.$route.query.source || null
    },
    showNoLiquidityMessage() {
      return !this.selectedQuote && !this.updatingQuotes
    },
    showBridgeAssetDisabledMessage() {
      const provider = this.selectedQuote?.provider
      const bridgeAsset = this.selectedQuote?.bridgeAsset
      const enabledAssets = this.enabledAssets[this.activeNetwork][this.activeWalletId]

      return (
        (provider === SwapProviderType.LiqualityBoostNativeToERC20 ||
          provider === SwapProviderType.LiqualityBoostERC20ToNative) &&
        !enabledAssets.includes(bridgeAsset)
      )
    },
    showNativeAssetDisabledMessage() {
      const isSameChain = this.assetChain === this.toAssetChain
      const enabledAssets = this.enabledAssets[this.activeNetwork][this.activeWalletId]
      return isSameChain && !enabledAssets.includes(getNativeAsset(this.asset))
    },
    sendAmount: {
      get() {
        return this.stateSendAmount
      },
      set(newValue) {
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
      get() {
        return this.stateSendAmountFiat
      },
      set(newValue) {
        if (!newValue) {
          this.stateAmountFiat = 0.0
          this.stateAmount = 0.0
        } else {
          this.stateSendAmountFiat = newValue.replace('$', '')
          this.stateSendAmount = fiatToCrypto(
            this.stateSendAmountFiat?.replaceAll(',', ''),
            this.fiatRates[this.asset]
          )
        }
      }
    },
    receiveAmount() {
      return this.selectedQuote
        ? unitToCurrency(cryptoassets[this.toAsset], this.selectedQuote.toAmount).toFixed()
        : BN(0)
    },
    receiveAmountFiat() {
      return cryptoToFiat(this.receiveAmount, this.fiatRates[this.toAsset])
    },
    ...mapState([
      'marketData',
      'fees',
      'fiatRates',
      'activeWalletId',
      'activeNetwork',
      'enabledAssets'
    ]),
    ...mapGetters(['client', 'accountItem', 'accountsData']),
    networkMarketData() {
      return this.marketData[this.activeNetwork]
    },
    networkWalletBalances() {
      return this.account?.balances
    },
    quoteRate() {
      if (!this.selectedQuote) return null
      const rate = calculateQuoteRate(this.selectedQuote)
      return dpUI(rate)
    },
    bestQuote() {
      const sortedQuotes = sortQuotes(this.quotes, this.activeNetwork)
      return sortedQuotes
    },
    selectedQuoteProvider() {
      if (!this.selectedQuote) return null
      return getSwapProvider(this.activeNetwork, this.selectedQuote.provider)
    },
    defaultAmount() {
      return this.max
    },
    isPairAvailable() {
      const liqualityMarket = this.networkMarketData?.find(
        (pair) =>
          (pair.from === this.asset ||
            buildConfig.supportedBridgeAssets.indexOf(this.assetChain) !== -1) &&
          (pair.to === this.toAsset ||
            buildConfig.supportedBridgeAssets.indexOf(this.toAssetChain) !== -1)
      )
      return !!liqualityMarket
    },
    min() {
      return Math.ceil(this.minSwapAmount * Math.pow(10, 6)) / Math.pow(10, 6)
    },
    max() {
      return this.available && !isNaN(this.available) ? BN.min(BN(this.available)) : BN(0)
    },
    nativeAssetRequired() {
      if (!this.networkWalletBalances || !isERC20(this.asset) || this.asset === 'ARBETH') return 0
      const nativeAssetBalance = this.networkWalletBalances[getNativeAsset(this.asset)]
      if (
        !nativeAssetBalance ||
        BN(nativeAssetBalance).lte(0) ||
        BN(nativeAssetBalance).minus(BN(this.maxFee).times(1.5)).lt(0)
      )
        return true
      return false
    },
    safeAmount() {
      return this.sendAmount || 0
    },
    fromSwapFee() {
      const selectedSpeed = this.selectedFee[this.assetChain]
      const fee =
        this.amountOption === 'max'
          ? this.maxSwapFees[this.assetChain]?.[selectedSpeed]
          : this.swapFees[this.assetChain]?.[selectedSpeed]
      return fee || BN(0)
    },
    receiveFee() {
      if (this.selectedQuote?.receiveFee) {
        return unitToCurrency(cryptoassets[this.toAsset], this.selectedQuote.receiveFee).toFixed()
      }
      if (!this.receiveFeeRequired) return BN(0)
      const selectedSpeed = this.selectedFee[this.toAssetChain]
      const fee =
        this.amountOption === 'max'
          ? this.maxSwapFees[this.toAssetChain]?.[selectedSpeed]
          : this.swapFees[this.toAssetChain]?.[selectedSpeed]
      return fee || BN(0)
    },
    hasPredefinedReceiveFee() {
      return this.selectedQuote?.receiveFee
    },
    maxFee() {
      try {
        const selectedSpeed = this.selectedFee[this.assetChain]
        const fee = this.maxSwapFees[this.assetChain]?.[selectedSpeed] || 0

        const getExtraAmountToExtractFromBalance =
          this.selectedQuoteProvider?.getExtraAmountToExtractFromBalance
        let extraAmountToExtractFromBalance = 0
        if (getExtraAmountToExtractFromBalance) {
          extraAmountToExtractFromBalance = getExtraAmountToExtractFromBalance()
        }

        const totalFees = currencyToUnit(cryptoassets[this.assetChain], fee).plus(
          extraAmountToExtractFromBalance
        )
        return totalFees ? totalFees : BN(0)
      } catch (error) {
        const liqualityErrorString = errorToLiqualityErrorString(error)
        reportLiqualityError(error)
        return {
          error: liqualityErrorString
        }
      }
    },
    receiveFeeRequired() {
      return this.selectedQuoteProvider?.toTxType
    },
    available() {
      if (!this.networkWalletBalances) return BN(0)

      // Some swap providers like "Jupiter" require extra amount to be extract from balance
      // when perforing swaps using "MAX"

      const balance = this.networkWalletBalances[this.asset]
      const available = isERC20(this.asset)
        ? BN(balance)
        : BN.max(BN(balance).minus(BN(this.maxFee).times(1.5)), 0)

      return unitToCurrency(cryptoassets[this.asset], available)
    },
    availableBeforeFees() {
      if (!this.networkWalletBalances) return BN(0)
      const balance = this.networkWalletBalances[this.asset]
      return unitToCurrency(cryptoassets[this.asset], BN(balance))
    },
    canCoverAmmFee() {
      if (!this.selectedQuote?.bridgeAsset) return true

      const account = isERC20(this.asset) ? this.account : this.toAccount
      const balance = account?.balances[this.selectedQuote.bridgeAsset]

      if (!balance) return true

      const SwapFeeInUnits = currencyToUnit(
        cryptoassets[this.selectedQuote.bridgeAsset],
        isERC20(this.asset) ? this.fromSwapFee : this.receiveFee
      )

      return BN(balance).gt(SwapFeeInUnits)
    },
    availableAmount() {
      return dpUI(this.available, VALUE_DECIMALS)
    },
    ethRequired() {
      if (this.assetChain === 'ETH') {
        return !this.account?.balances?.ETH || this.account?.balances?.ETH === 0
      }

      if (this.toAssetChain === 'ETH' && this.selectedQuote?.provider == 'liquality') {
        return (
          !this.toAccount?.balances?.ETH ||
          this.toAccount?.balances?.ETH === 0 ||
          BN(this.toAccount?.balances?.ETH).lt(
            currencyToUnit(cryptoassets[this.toAssetChain], this.receiveFee)
          )
        )
      }

      return false
    },
    showErrors() {
      return false
    },
    insufficientFundsError() {
      const amount = BN(this.safeAmount)
      if (amount.gt(this.max)) {
        return true
      }
      return false
    },
    amountError() {
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
      if (
        this.selectedQuote?.receiveFee &&
        BN(this.selectedQuote.toAmount).lt(
          BN(this.selectedQuote.receiveFee).times(this.selectedQuote.maxFeeSlippageMultiplier || 1)
        )
      ) {
        return `Increase amount. Should cover ${
          this.selectedQuote?.maxFeeSlippageMultiplier || 1
        }x ${this.toAssetChain} fee.`
      }

      return null
    },
    canSwap() {
      if (
        !this.selectedQuote ||
        this.updatingQuotes ||
        this.ethRequired ||
        //!this.canCoverAmmFee ||
        this.showBridgeAssetDisabledMessage ||
        this.showNoLiquidityMessage ||
        this.amountError ||
        this.nativeAssetRequired ||
        BN(this.safeAmount).lte(0)
      ) {
        return false
      }

      return true
    },
    cannotCoverNetworkFee() {
      return (
        this.ethRequired ||
        !this.canCoverAmmFee ||
        this.nativeAssetRequired ||
        (BN(this.available).lt(this.sendAmount) && !BN(this.sendAmount).eq(this.defaultAmount))
      )
    },
    cannotCoverReceiveFee() {
      return (
        this.selectedQuote?.receiveFee &&
        BN(this.selectedQuote.toAmount).lt(
          BN(this.selectedQuote.receiveFee).times(this.selectedQuote?.maxFeeSlippageMultiplier || 1)
        )
      )
    },
    assetChain() {
      return getNativeAsset(this.asset)
    },
    toAssetChain() {
      return getNativeAsset(this.toAsset)
    },
    availableFees() {
      const availableFees = new Set([])
      const fees = this.getAssetFees(this.assetChain)
      const toFees = this.getAssetFees(this.toAssetChain)
      if (fees && Object.keys(fees).length) availableFees.add(this.assetChain)
      if (toFees && Object.keys(toFees).length && this.receiveFeeRequired) {
        availableFees.add(this.toAssetChain)
      }
      return availableFees
    },
    sendAmountSameAsset() {
      return BN(this.safeAmount).plus(this.fromSwapFee)
    },
    totalToSendInFiat() {
      const send = cryptoToFiat(BN(this.stateSendAmount), this.fiatRates[this.asset])
      if (isNaN(send)) return send

      const fee = cryptoToFiat(this.fromSwapFee, this.fiatRates[this.assetChain])
      return send.plus(fee).toFormat(2)
    },

    receiveAmountSameAsset() {
      return BN(this.receiveAmount).minus(this.receiveFee).toFixed()
    },
    totalToReceiveInFiat() {
      const receive = cryptoToFiat(this.receiveAmount, this.fiatRates[this.toAsset])
      if (isNaN(receive)) return receive
      const fee = cryptoToFiat(
        this.receiveFee,
        this.fiatRates[this.hasPredefinedReceiveFee ? this.toAsset : this.toAssetChain]
      )
      return receive.minus(fee).toFormat(2)
    },
    assetsFeeSelector() {
      return {
        [this.assetChain]: this.asset,
        [this.toAssetChain]: this.toAsset
      }
    },
    isHighFee() {
      const feeTotal = cryptoToFiat(
        this.receiveFee,
        this.fiatRates[this.selectedQuote?.bridgeAsset || this.toAssetChain]
      ).plus(cryptoToFiat(this.fromSwapFee, this.fiatRates[this.assetChain]))
      const receiveTotalPercentage = isNaN(this.totalToReceiveInFiat)
        ? 0
        : this.totalToReceiveInFiat * 0.15
      return receiveTotalPercentage !== 0 && feeTotal.gte(BN(receiveTotalPercentage))
    },
    isSwapNegative() {
      return this.totalToReceiveInFiat < 0
    },
    isEIP1559Fees() {
      return isEIP1559Fees(cryptoassets[this.customFeeAssetSelected].chain, this.activeNetwork)
    }
  },
  methods: {
    ...mapActions([
      'updateMarketData',
      'getQuotes',
      'getSlowQuotes',
      'updateFees',
      'newSwap',
      'updateFiatRates'
    ]),
    ...mapActions('app', ['trackAnalytics']),
    ...mapGetters(['suggestedFeePrices']),
    shortenAddress,
    dpUI,
    prettyBalance,
    prettyFiatBalance,
    formatFiatUI,
    getAssetIcon,
    getAssetColorStyle,
    formatFiat,
    getAssetFees(asset) {
      const assetFees = {}
      if (this.customFees[asset]) {
        assetFees.custom = { fee: this.customFees[asset] }
      }
      const fees = this.suggestedFeePrices()(asset)
      if (fees) {
        Object.assign(assetFees, fees)
      }

      return assetFees
    },
    setSendAmount(amount) {
      this.sendAmount = amount
      if (amount === this.max) {
        this.amountOption = 'max'
      } else if (amount === this.min) {
        this.amountOption = 'min'
      }
    },
    setToAsset(toAsset) {
      this.toAsset = toAsset
      if (this.amountOption === 'max') {
        this.sendAmount = this.max
      } else if (this.amountOption === 'min') {
        this.sendAmount = this.min
      } else if (!this.amountOption && !this.sendAmount) {
        this.sendAmount = dpUI(this.defaultAmount)
      }
      this.resetFees()
      this.updateQuotes()
      this.updateFiatRates({ assets: [toAsset] })
      this.trackAnalytics({
        event: `User clicked on ${this.toAsset} Swap option`,
        properties: {
          walletVersion,
          category: 'Swap screen',
          action: 'User on SWAP screen',
          label: `${this.toAsset}`
        }
      })
    },
    setFromAsset(asset, amount) {
      this.asset = asset
      if (amount) {
        amount = unitToCurrency(cryptoassets[asset], amount).toFixed()
      }
      this.sendAmount = dpUI(amount ?? this.defaultAmount)
      this.resetFees()
      this.updateQuotes()
      this.updateFiatRates({ assets: [asset] })
    },
    onReverseAssets(fromAsset, toAsset, selectedQuote, fromAccountId, toAccountId) {
      if (this.updatingQuotes) return
      this.amountOption = null
      const toAmount = selectedQuote?.toAmount || 0
      this.fromAssetChanged(toAccountId, toAsset, toAmount)
      this.toAssetChanged(fromAccountId, fromAsset)
    },
    async _updateSwapFees(max) {
      if (!this.selectedQuote) return
      const fees = {
        [this.assetChain]: newSendFees(),
        [this.toAssetChain]: newSendFees()
      }

      const selectedQuoteProvider = this.selectedQuoteProvider
      const { fromTxType, toTxType } = selectedQuoteProvider

      const addFees = async (asset, chain, txType) => {
        const assetFees = this.getAssetFees(chain)
        const chainId = cryptoassets[chain].chain

        const totalFees = await selectedQuoteProvider.estimateFees({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          asset,
          txType,
          quote: this.selectedQuote,
          feePrices: Object.values(assetFees).map((fee) => feePerUnit(fee.fee, chainId)),
          feePricesL1: getChain(this.activeNetwork, chainId).isMultiLayered
            ? Object.values(assetFees).map((fee) => feePerUnit(fee.multilayerFee?.l1, chainId))
            : undefined,
          max
        })

        if (!totalFees) return

        for (const [speed, fee] of Object.entries(assetFees)) {
          const feePrice = feePerUnit(fee.fee, cryptoassets[asset].chain)
          fees[chain][speed] = fees[chain][speed].plus(totalFees[feePrice])
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

      if (this.activeNetwork && this.asset && this.toAsset && this.sendAmount) {
        this.minSwapAmount = await selectedQuoteProvider.getMin({
          network: this.activeNetwork,
          from: this.asset,
          to: this.toAsset,
          amount: BN(this.sendAmount)
        })
      }
    },
    updateSwapFees: _.debounce(async function () {
      await this._updateSwapFees(false)
    }, 800),
    async updateMaxSwapFees() {
      await this._updateSwapFees(true)
    },
    resetFees() {
      const selectedFee = {}
      if (this.assetChain) {
        ;(async () => {
          await this.updateFees({ asset: this.assetChain })
          await this.updateMaxSwapFees()
        })()

        selectedFee[this.assetChain] = 'fast'
      }
      if (this.toAssetChain) {
        this.updateFees({ asset: this.toAssetChain })
        selectedFee[this.toAssetChain] = 'fast'
      }
      this.selectedFee = { ...selectedFee }
    },
    resetCustomFee(asset) {
      delete this.customFees[asset]
      this.resetFees()
    },
    cancelCustomFee(asset) {
      this.currentStep = 'inputs'
      this.selectedFee[asset] = 'fast'
    },
    resetQuoteTimer(resetInterval) {
      clearTimeout(this.quoteTimer)
      this.quoteTimer = setTimeout(() => {
        this.updateQuotes()
      }, resetInterval)
    },
    debounceUpdateQuotes: _.debounce(async function () {
      await this._updateQuotes()
    }, 1000),
    setQuotes(quotes, shouldReselect) {
      let shouldChooseNewQuote = false
      if (
        quotes &&
        quotes.length &&
        quotes.every((quote) => quote.from === this.asset && quote.to === this.toAsset)
      ) {
        this.quotes = quotes
        if (!shouldReselect) return
        if (this.selectedQuote) {
          // Preserve selected provider
          if (this.userSelectedQuote) {
            const matchingQuote = this.quotes.find(
              (q) => q.provider === this.selectedQuote.provider
            )
            this.selectedQuote = matchingQuote || this.bestQuote[0]
          } else {
            this.userSelectedQuote = false
            if (!this.canSwap) {
              for (const quoteIndex in this.bestQuote) {
                if (parseInt(quoteIndex) + 1 === this.bestQuote.length) {
                  this.selectedQuote = this.bestQuote[quoteIndex]
                  shouldChooseNewQuote = false
                  break
                }
                if (this.bestQuote[quoteIndex].provider === this.selectedQuote.provider) {
                  shouldChooseNewQuote = true
                  continue
                }
                if (shouldChooseNewQuote) {
                  this.selectedQuote = this.bestQuote[quoteIndex]
                  break
                }
              }
            } else {
              this.selectedQuote = this.bestQuote[0]
            }
          }
        } else {
          this.selectedQuote = this.bestQuote[0]
        }
      } else {
        this.selectedQuote = null
      }

      // this.cannotCoverMinimum =
      //   !this.canSwap &&
      //   !shouldChooseNewQuote &&
      //   !BN(this.sendAmount).eq(this.defaultAmount) &&
      //   BN(this.sendAmount).lt(this.max)
      // if(this.cannotCoverMinimum) this.sendAmount = 1
      this.resetQuoteTimer(!this.canSwap && shouldChooseNewQuote ? 10000 : QUOTE_TIMER_MS)
    },
    async _updateQuotes() {
      const result = await this.getQuotes({
        network: this.activeNetwork,
        from: this.asset,
        to: this.toAsset,
        fromAccountId: this.fromAccountId,
        toAccountId: this.toAccountId,
        amount: BN(this.sendAmount),
        walletId: this.activeWalletId,
        slowQuoteThreshold: 5000
      })

      const quotes = result.quotes
      if (result.hasSlowQuotes) {
        this.getSlowQuotes({ requestId: result.requestId }).then((slowQuotes) => {
          const shouldReselect = !quotes.length // Reselect on slow quotes if there were no fast quotes
          this.setQuotes([...this.quotes, ...slowQuotes], shouldReselect)
          this.updatingQuotes = false
        })
      } else {
        this.updatingQuotes = false
      }

      this.setQuotes(quotes, true)
    },
    updateQuotes() {
      if (BN(this.sendAmount).eq(0)) return // Don't update quote when amount 0
      if (this.currentStep !== 'inputs') return // Don't update quote when in review
      this.quotes = []
      this.updatingQuotes = true
      this.debounceUpdateQuotes()
    },
    setQuoteProvider(provider) {
      const matchingQuote = this.quotes.find((q) => q.provider === provider)
      this.selectedQuote = matchingQuote
    },
    selectQuote(provider) {
      this.setQuoteProvider(provider)
      this.userSelectedQuote = true
      this.showQuotesModal = false
    },
    review() {
      if (this.canSwap) {
        if (this.account?.type.includes('ledger') && this.$route.query?.mode !== 'tab') {
          // open in a new tab
          const swapParams = qs.stringify({
            mode: 'tab',
            selectedFee: this.selectedFee,
            sendAmount: BN(this.sendAmount).toString(),
            toAccountId: this.toAccountId,
            toAsset: this.toAsset,
            customFees: this.customFees,
            userSelectedQuote: this.userSelectedQuote,
            currentStep: 'confirm',
            maxOptionActive: this.maxOptionActive,
            selectedQuote: this.selectedQuote
          })
          const url = `/index.html#/accounts/${this.accountId}/${this.asset}/swap?${swapParams}`
          browser.tabs.create({ url: browser.runtime.getURL(url) })
        } else {
          this.currentStep = 'confirm'
        }
      }
    },
    async swap() {
      this.swapErrorMessage = ''
      this.swapErrorModalOpen = false
      this.loading = true
      if (this.account?.type.includes('ledger')) {
        this.signRequestModalOpen = true
      }
      try {
        const fee = this.availableFees.has(this.assetChain)
          ? this.getAssetFees(this.assetChain)[this.selectedFee[this.assetChain]].fee
          : undefined

        const toFee =
          this.receiveFeeRequired && this.availableFees.has(this.toAssetChain)
            ? this.getAssetFees(this.toAssetChain)[this.selectedFee[this.toAssetChain]].fee
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
        reportLiqualityError(error)
        this.loading = false
        this.signRequestModalOpen = false
        this.swapErrorMessage = errorToLiqualityErrorString(error)
        this.swapErrorModalOpen = true
      }
    },
    getSelectedFeeLabel(fee) {
      return fee ? getFeeLabel(fee) : ''
    },
    back() {
      this.currentStep = 'inputs'
    },
    toAssetClick() {
      this.assetSelection = 'to'
      this.currentStep = 'accounts'
    },
    fromAssetClick() {
      this.assetSelection = 'from'
      this.currentStep = 'accounts'
    },
    fromAssetChanged(accountId, fromAsset, amount = null) {
      this.fromAccountId = accountId
      this.setFromAsset(fromAsset, amount)
    },
    toAssetChanged(accountId, toAsset) {
      this.toAccountId = accountId
      this.setToAsset(toAsset)
    },
    assetChanged({ accountId, asset }) {
      if (this.assetSelection === 'to') {
        this.toAssetChanged(accountId, asset)
      } else {
        this.fromAssetChanged(accountId, asset)
      }
      this.currentStep = 'inputs'

      this.trackNoLiquidity()
    },
    closeSwapErrorModal() {
      this.swapErrorModalOpen = false
      this.loading = false
    },
    closeSignRequestModal() {
      this.signRequestModalOpen = false
      this.loading = false
    },
    getTotalSwapFee(asset) {
      if (asset === this.assetChain) {
        return this.fromSwapFee
      } else if ((asset === this.toAssetChain || asset === this.toAsset) && this.receiveFee) {
        return this.receiveFee
      }
    },
    chainAssetSwapFee(asset, chainAsset) {
      const selectedSpeed = this.selectedFee[chainAsset]
      const fees = this.getAssetFees(chainAsset)
      const chainId = cryptoassets[asset].chain
      const { unit } = getChain(this.activeNetwork, chainId)?.fees || ''
      return `${fees?.[selectedSpeed].fee || BN(0)} ${unit}`
    },
    getChainAssetSwapFee(asset) {
      if (asset === this.assetChain) {
        return this.chainAssetSwapFee(asset, this.assetChain)
      } else if (asset === this.toAssetChain && this.receiveFee) {
        if (!this.receiveFeeRequired) return BN(0)
        return this.chainAssetSwapFee(asset, this.toAssetChain)
      }
    },
    getTotalSwapFeeInFiat(asset) {
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
    getAccountId() {
      if (
        this.selectedQuoteProvider?.config.type === SwapProviderType.LiqualityBoostERC20ToNative
      ) {
        return this.fromAccountId
      }

      return this.toAccountId
    },
    applyCustomFee({ asset, fee }) {
      const assetFees = this.getAssetFees(asset)
      const presetFee = Object.entries(assetFees).find(
        ([speed, speedFee]) =>
          speed !== 'custom' &&
          (speedFee.fee === fee ||
            (fee.maxPriorityFeePerGas &&
              speedFee.fee.maxPriorityFeePerGas === fee.maxPriorityFeePerGas &&
              speedFee.fee.maxFeePerGas === fee.maxFeePerGas))
      )
      if (presetFee) {
        const [speed] = presetFee
        this.selectedFee[asset] = speed
        this.customFees[asset] = null
      } else {
        this.updateMaxSwapFees()
        this.updateSwapFees()
        this.customFees[asset] = feePerUnit(fee, cryptoassets[asset].chain)
        this.selectedFee[asset] = 'custom'
      }
      this.currentStep = 'inputs'
    },
    onCustomFeeSelected(asset) {
      this.customFeeAssetSelected = getNativeAsset(asset)
      this.currentStep = 'custom-fees'
    },
    trackNoLiquidity() {
      if (this.showNoLiquidityMessage) {
        this.trackAnalytics({
          event: 'No Liquidity',
          properties: {
            walletVersion,
            category: 'Swap screen',
            action: 'No Liquidity for pairs',
            from: this.asset,
            to: this.toAsset
          }
        })
      }
    }
  },
  watch: {
    selectedFee: {
      handler() {
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
        if (amount.eq(min)) {
          this.amountOption = 'min'
        } else {
          this.amountOption = null
        }
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
.extreme-fee-text {
  color: #ff007a !important;
}
.high-fee-text {
  color: rgb(247, 147, 26) !important;
}

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
      font-weight: 600;
      margin: 6px 0;

      .fee-selector {
        margin-left: 6px;
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
}

#fees_are_high {
  background-color: #f0f7f9;
}
#swap_is_negative {
  background-color: rgba(255, 243, 188, 0.5);
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
    font-weight: 600;
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

.network-header-container {
  display: flex;
  flex-flow: column;
  gap: 5px;

  .network-header-state {
    margin-top: 5px;
  }
}

.selectors-asset {
  width: 60px !important;
}

.selector-asset-switch {
  display: flex;
  align-items: center;
}

.arrow-down {
  margin-top: 27px;
  display: flex;
  justify-content: center;

  #arrow {
    cursor: pointer;
  }

  svg {
    width: 20px;
    height: 18px;
    fill: #a8aeb7;
  }
}

#send_network_speed_avg_fee {
  margin-top: 0;
}
</style>
