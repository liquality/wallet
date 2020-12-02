<template>
  <div>
    <div class="swap" v-if="!showConfirm">
      <NavBar
        showBack="true"
        :backPath="`/account/${asset}`"
        :backLabel="asset"
      >
        Swap
      </NavBar>
      <InfoNotification v-if="ethRequired">
        <EthRequiredMessage />
      </InfoNotification>
      <div class="wrapper form">
        <div class="wrapper_top">
          <div class="form-group">
            <span class="float-left"><label for="amount">Send</label></span>
            <div class="float-right label-append text-muted">
              ${{ prettyFiatBalance(amount, fiatRates[asset]) }}
            </div>
            <div class="input-group swap_asset">
              <img
                :src="getAssetIcon(asset)"
                class="asset-icon swap_asset_icon"
              />
              <div class="input-group-append">
                <span class="input-group-text">{{ asset }}</span>
              </div>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': showErrors && amountError }"
                id="amount"
                v-model="amount"
                placeholder="0.00"
                :style="getAssetColorStyle(asset)"
                autocomplete="off"
              />
            </div>
            <small
              v-if="showErrors && amountError"
              class="text-danger form-text text-right"
            >
              {{ amountError }}
            </small>
          </div>
          <div class="form-group">
            <span class="label-sub">
              <span class="text-muted">Available</span>
              {{ available }} {{ asset }}
            </span>
            <div class="float-right btn-group btn-group-toggle">
              <v-popover offset="1" trigger="hover focus" class="mr-2">
                <label
                  :class="{ active: amount === min }"
                  class="btn btn-light btn-outline-dark btn-sm amount-option"
                  @click="setAmount(min)"
                >
                  Min
                </label>
                <template slot="popover">
                  <p class="my-0 text-right">
                    {{ min }} {{ asset }}
                  </p>
                  <p class="text-muted my-0 text-right">
                    {{ prettyFiatBalance(min, fiatRates[asset]) }} USD
                  </p>
                </template>
              </v-popover>
              <v-popover offset="1" trigger="hover focus">
                <label
                  :class="{ active: amount === max }"
                  class="btn btn-light btn-outline-dark btn-sm amount-option tooltip-target"
                  @click="setAmount(max)"
                >
                  Max
                </label>
                <template slot="popover">
                  <p class="my-0 text-right">
                    {{ max }} {{ asset }}
                  </p>
                  <p class="text-muted my-0 text-right">
                    {{ prettyFiatBalance(max, fiatRates[asset]) }} USD
                  </p>
                </template>
              </v-popover>
            </div>
          </div>
          <div class="swap-separator">
          </div>
          <div class="form-group">
            <span class="float-left">
              <label for="amount">Receive</label>
            </span>
            <div class="float-right label-append label-bordered">
              ${{ prettyFiatBalance(toAmount, fiatRates[toAsset]) }}
            </div>
            <div class="input-group swap_asset">
              <img
                :src="getAssetIcon(toAsset)"
                class="asset-icon swap_asset_icon"
              />
              <div class="input-group-append">
                <span class="input-group-text">
                  <select
                    class="custom-select"
                    @change="setToAsset($event.target.value)"
                    v-model="toAsset"
                  >
                    <option v-for="to in toAssets" :key="to" :value="to">
                      {{ to }}
                    </option>
                  </select>
                </span>
              </div>
              <input
                type="text"
                class="form-control"
                readonly
                v-model="toAmount"
                placeholder="0.00"
                :style="getAssetColorStyle(toAsset)"
                autocomplete="off"
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
            <label class="w-100" for="amount">
              Receive at
              <a
                class="text-muted float-right"
                @click="
                  enterSendToAddress = false;
                  sendTo = null;
                "
              >
                X
              </a>
            </label>
            <div class="input-group">
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
        </div>
        <div class="wrapper_bottom">
          <div class="swap_rate form-group">
            <label>Rate</label>
            <p>
              <span class="swap-rate_base">1 {{ asset }} =</span>
              <span class="swap-rate_value">
                &nbsp;{{ bestRateBasedOnAmount }}
              </span>
              <span class="swap-rate_term text-muted"
                >&nbsp;{{ toAsset }}</span
              >
            </p>
          </div>

          <div class="form-group swap_fees" v-if="availableFees.size">
            <DetailsContainer>
              <template v-slot:header>
                <span class="details-title">Network Speed/Fee</span>
                <span class="text-muted">
                  {{ assetChain }}
                  {{ getSelectedFeeLabel(selectedFee[assetChain]) }} /
                  {{ toAssetChain }}
                  {{ getSelectedFeeLabel(selectedFee[toAssetChain]) }}
                </span>
              </template>
              <template v-slot:content>
                <ul class="selectors">
                  <li v-for="asset in availableFees" :key="asset">
                  <span class="mr-2 font-weight-bold">{{ asset }}</span>
                  <FeeSelector
                    :asset="asset"
                    v-model="selectedFee[asset]"
                    v-bind:fees="getAssetFees(asset)"
                    v-bind:txTypes="getFeeTxTypes(asset)"
                  />
                </li>
                </ul>
              </template>
            </DetailsContainer>
          </div>

          <div class="button-group">
            <router-link :to="`/account/${asset}`">
              <button class="btn btn-light btn-outline-primary btn-lg">
                Cancel
              </button>
            </router-link>
            <button
              class="btn btn-primary btn-lg"
              @click="showConfirm = true"
              :disabled="!bestMarketBasedOnAmount || !canSwap"
            >
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="swap-confirm wrapper form text-center" v-if="showConfirm">
      <div class="wrapper_top form">
        <div class="form-group">
          <label>
            Send <span v-if="includeFees" class="text-muted">(INCL FEES)</span>
          </label>
          <p class="confirm-value" :style="getAssetColorStyle(asset)">
            {{ amountToSend }} {{ asset }}
          </p>
          <div v-if="!includeFees">~{{ totalFees[assetChain] }} ETH FEES</div>
          <div class="text-muted">${{ amountToSendInFiat }}</div>
        </div>
        <div class="form-group">
          <label>Receive <span class="text-muted">(EXCL FEES)</span></label>
          <p class="confirm-value" :style="getAssetColorStyle(toAsset)">
            {{ toAmount }} {{ toAsset }}
          </p>
          <p class="text-muted">${{ amountToReveiveInFiat }}</p>
        </div>
      </div>

      <div class="wrapper_bottom">
        <DetailsContainer>
          <template v-slot:header>
            <span class="details-title">Details</span>
          </template>
          <template v-slot:content>
            <ul class="items">
              <li><label>Send</label></li>
            <li>
              <span class="text-muted">
                AMOUNT:&nbsp;{{ amountToSend }} {{ asset }} / ${{
                  amountToSendInFiat
                }}</span
              >
            </li>
            <li>
              <span class="text-muted"
                >NETWORK FEES:&nbsp; {{ totalFees[assetChain] }}
                {{ sendFeeType }} / (${{
                  prettyFiatBalance(totalFees[assetChain], fiatRates[asset])
                }})
              </span>
            </li>
            <li class="mt-2"><label>Receive</label></li>
            <li>
              <span class="text-muted">
                AMOUNT:&nbsp;{{ toAmount }} {{ toAsset }} / ${{
                  amountToReveiveInFiat
                }}</span
              >
            </li>
            <li>
              <span class="text-muted"
                >NETWORK FEES:&nbsp; {{ totalFees[toAssetChain] }}
                {{ receiveFeeType }} / (${{
                  prettyFiatBalance(
                    totalFees[toAssetChain],
                    fiatRates[toAsset]
                  )
                }})
              </span>
            </li>
            <li>
              <span class="text-muted" v-if="sendTo">
                AT: External Wallet - {{ shortenAddress(sendTo) }}
                <CopyIcon class="copy-icon"
                          @click="copy(sendTo)"
                          v-tooltip.bottom="{
                              content: sendToCopied ? 'Copied!' : 'Copy',
                              hideOnTargetClick: false
                          }"
                />
              </span>
              <span v-else class="text-muted">
                AT: This Wallet
              </span>
            </li>
            <li>
              <span class="text-muted"
                >Rate: 1 {{ asset }}&nbsp;=&nbsp;{{
                  bestRateBasedOnAmount
                }}
                &nbsp;{{ toAsset }}</span
              >
            </li>
            </ul>
          </template>
        </DetailsContainer>
        <div class="swap-info">
          <div class="media">
            <ClockIcon class="swap-info_clock" />
            <p class="text-muted media-body">
              If the swap doesn’t complete in 3 hours, you will be refunded in 6
              hours at {{ expiration }}
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
</template>

<script>
import { mapState, mapActions } from 'vuex'
import BN from 'bignumber.js'
import { add, format } from 'date-fns'
import cryptoassets from '@/utils/cryptoassets'
import FeeSelector from '@/components/FeeSelector'
import NavBar from '@/components/NavBar'
import InfoNotification from '@/components/InfoNotification'
import EthRequiredMessage from '@/components/EthRequiredMessage'
import { dpUI, prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import {
  getChainFromAsset,
  getAssetColorStyle,
  getAssetIcon
} from '@/utils/asset'
import { shortenAddress } from '@/utils/address'
import {
  TX_TYPES,
  FEE_TYPES,
  getTxFee,
  getFeeLabel
} from '@/utils/fees'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ClockIcon from '@/assets/icons/clock.svg'
import ArrowDownIcon from '@/assets/icons/arrow_down.svg'
import CopyIcon from '@/assets/icons/copy.svg'
import DetailsContainer from '@/components/DetailsContainer'

export default {
  components: {
    NavBar,
    InfoNotification,
    EthRequiredMessage,
    FeeSelector,
    ClockIcon,
    SwapIcon,
    SpinnerIcon,
    DetailsContainer,
    ArrowDownIcon,
    CopyIcon
  },
  data () {
    return {
      amount: 0,
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
        else if (amount.gte(BN(a.sellMin)) && amount.lte(BN(a.sellMax))) { return 1 } else return 0
      })[0]
    },
    min () {
      return dpUI(BN(this.market.sellMin), this.asset)
    },
    max () {
      const max = BN.min(
        BN(this.available),
        dpUI(this.market.sellMax, this.asset)
      )
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
      return this.networkWalletBalances.ETH === 0
    },
    showErrors () {
      return !this.ethRequired
    },
    amountError () {
      const amount = BN(this.safeAmount)

      if (amount.gt(this.available)) { return 'Lower amount. This exceeds available balance.' }
      if (amount.gt(this.max)) { return 'Please reduce amount. It exceeds maximum.' }
      if (amount.lt(this.min)) { return 'Please increase amount. It is below minimum.' }

      return null
    },
    canSwap () {
      if (this.ethRequired || this.amountError) return false

      return true
    },
    toAmount () {
      return dpUI(
        BN(this.safeAmount).times(this.bestRateBasedOnAmount),
        this.toAsset
      )
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
      if (toFees && Object.keys(toFees).length) { availableFees.add(this.toAssetChain) }
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
    amountToSend () {
      if (this.feeType === FEE_TYPES.BTC) {
        return BN(this.amount).plus(BN(this.totalFees[this.assetChain]))
      }
      return this.amount
    },
    amountToSendInFiat () {
      return prettyFiatBalance(this.amountToSend, this.fiatRates[this.asset])
    },
    amountToReveiveInFiat () {
      return prettyFiatBalance(this.toAmount, this.fiatRates[this.toAsset])
    },
    currentWalletAddress () {
      const address = this.addresses[this.activeNetwork]?.[this.activeWalletId]?.[this.asset]
      return address && cryptoassets[this.asset].formatAddress(address)
    }
  },
  methods: {
    ...mapActions(['updateMarketData', 'updateFees', 'newSwap']),
    shortenAddress,
    prettyBalance,
    prettyFiatBalance,
    getAssetIcon,
    getAssetColorStyle,
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

.amount-option {
  border-radius: 26px !important;
  font-size: $font-size-tiny;
}

.swap-separator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;

  svg {
    height: 18px;
  }
}

svg.copy-icon {
          cursor: pointer;
          width: 14px;
          margin-left: 6px;
}
</style>
