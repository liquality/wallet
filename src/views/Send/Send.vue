<template>
  <div>
    <div class="send" v-if="!showConfirm">
      <NavBar
        showBack="true"
        :backPath="routeSource === 'assets' ? '/wallet' : `/accounts/${account.id}/${asset}`"
        :backLabel="routeSource === 'assets' ? 'Overview' : asset"
      >
        Send
      </NavBar>
      <div class="wrapper form">
        <div class="wrapper_top">
           <SendInput
            :asset="asset"
            :amount="amount"
            :amount-fiat="amountFiat"
            @update:amount="(newAmount) => (amount = newAmount)"
            @toogle-max="toogleMaxAmount"
            @update:amountFiat="(amount) => (amountFiat = amount)"
            :max="available"
            :available="available"
            :max-fiat="prettyFiatBalance(available, fiatRates[asset])"
            :amount-error="amountError"
            :max-active="maxOptionActive"
          />
          <div class="form-group mt-40">
            <label for="address">Send to</label>
            <div class="input-group">
              <input
                type="text"
                :class="{ 'is-invalid': address && addressError }"
                v-model="address"
                class="form-control form-control-sm"
                id="address"
                placeholder="Address"
                autocomplete="off"
                required
              />
            </div>
            <small
              v-if="address && addressError"
              class="text-danger form-text text-right"
              >{{ addressError }}</small
            >
          </div>
          <div class="form-group mt-150">
          <DetailsContainer v-if="feesAvailable">
            <template v-slot:header>
              <span class="details-title">Network Speed/Fee</span>
              <span class="text-muted">
                ({{ selectedFeeLabel }} / {{ prettyFee }} {{ feeType }})
              </span>
            </template>
            <template v-slot:content>
              <ul class="selectors">
                <li>
                  <div class="send_fees">
                    <span class="selectors-asset">{{ assetChain }}</span>
                    <FeeSelector
                      :asset="asset"
                      v-model="selectedFee"
                      v-bind:fees="assetFees"
                      v-bind:txTypes="[txType]"
                      v-bind:fiatRates="fiatRates"
                    />
                  </div>
                </li>
              </ul>
            </template>
          </DetailsContainer>
        </div>
        </div>
        <div class="wrapper_bottom">
          <div class="button-group">
            <router-link :to="routeSource === 'assets' ? '/wallet' : `/accounts/${this.account.id}/${asset}`">
              <button class="btn btn-light btn-outline-primary btn-lg">
                Cancel
              </button>
            </router-link>
            <button
              class="btn btn-primary btn-lg"
              @click="showConfirm = true"
              :disabled="!canSend"
            >
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <NavBar
        :showBackButton="true"
        :backClick="back"
        backLabel="Back"
      >
        Send
      </NavBar>
      <div class="send-confirm wrapper form">
      <div class="wrapper_top form">
        <div>
          <label>
            Send
          </label>
          <div class="d-flex align-items-center justify-content-between mt-0">
            <div class="confirm-value" :style="getAssetColorStyle(asset)">
            {{ dpUI(amount) }} {{ asset }}
          </div>
          <div class="details-text">${{ amountInFiat }}</div>
          </div>
        </div>
        <div class="detail-group">
          <label class="text-muted">
            Network Fee
          </label>
          <div class="d-flex align-items-center justify-content-between mt-0">
            <div>
            ~{{ prettyFee }} {{ feeType }}
          </div>
          <div class="details-text">${{ totalFeeInFiat }}</div>
          </div>
        </div>
        <div class="detail-group">
          <label class="text-muted">
            Amount + Fees
          </label>
          <div class="d-flex align-items-center justify-content-between mt-0">
            <div class="font-weight-bold" v-if="asset === feeType">
              {{ dpUI(amountWithFee) }} {{ asset }}
            </div>
             <div class="font-weight-bold" v-else>
              {{ dpUI(amount) }} {{ asset }} + {{ prettyFee }} {{ feeType }}
            </div>
          <div class="font-weight-bold">${{ totalToSendInFiat }}</div>
          </div>
        </div>
        <div class="mt-40">
          <label>Send To</label>
          <p class="confirm-address">{{ shortenAddress(this.address) }}</p>
        </div>
      </div>
      <div class="wrapper_bottom">
        <div class="button-group">
          <button
            class="btn btn-light btn-outline-primary btn-lg"
            v-if="!loading"
            @click="showConfirm = false"
          >
            Edit
          </button>
          <button
            class="btn btn-primary btn-lg btn-icon"
            @click="send"
            :disabled="loading"
          >
            <SpinnerIcon class="btn-loading" v-if="loading" />
            <template v-else>Send {{ asset }}</template>
          </button>
        </div>
      </div>
    </div>
    <!-- Modals for ledger prompts -->
    <OperationErrorModal :open="sendErrorModalOpen"
                         :account="account"
                         @close="closeSendErrorModal"
                         :error="sendErrorMessage" />
    <LedgerSignRequestModal :open="signRequestModalOpen"
                            @close="closeSignRequestModal" />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import BN from 'bignumber.js'
import cryptoassets from '@/utils/cryptoassets'
import { chains, currencyToUnit, unitToCurrency } from '@liquality/cryptoassets'
import NavBar from '@/components/NavBar'
import FeeSelector from '@/components/FeeSelector'
import { prettyBalance, prettyFiatBalance, dpUI, fiatToCrypto } from '@/utils/coinFormatter'
import {
  getNativeAsset,
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
import SpinnerIcon from '@/assets/icons/spinner.svg'
import DetailsContainer from '@/components/DetailsContainer'
import SendInput from './SendInput'
import LedgerSignRequestModal from '@/components/LedgerSignRequestModal'
import OperationErrorModal from '@/components/OperationErrorModal'

export default {
  components: {
    NavBar,
    FeeSelector,
    SpinnerIcon,
    DetailsContainer,
    SendInput,
    OperationErrorModal,
    LedgerSignRequestModal
  },
  data () {
    return {
      stateAmount: 0,
      stateAmountFiat: 0,
      address: null,
      selectedFee: 'average',
      showConfirm: false,
      loading: false,
      maxOptionActive: false,
      sendErrorModalOpen: false,
      signRequestModalOpen: false,
      sendErrorMessage: ''
    }
  },
  props: {
    asset: String,
    accountId: String
  },
  computed: {
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'fees',
      'fiatRates'
    ]),
    ...mapGetters([
      'accountItem'
    ]),
    account () {
      return this.accountItem(this.accountId)
    },
    amount: {
      get () {
        return this.stateAmount
      },
      set (newValue) {
        if (newValue && !isNaN(newValue)) {
          this.stateAmount = newValue
        } else {
          this.stateAmount = 0.0
        }
        this.stateAmountFiat = prettyFiatBalance(
          this.stateAmount,
          this.fiatRates[this.asset]
        )
      }
    },
    amountFiat: {
      get () {
        return `$${this.stateAmountFiat}`
      },
      set (newValue) {
        const value = (newValue || '0').replace('$', '')
        this.stateAmountFiat = value
        this.stateAmount = fiatToCrypto(value, this.fiatRates[this.asset])
      }
    },
    balance () {
      return this.account.balances[this.asset] || 0
    },
    routeSource () {
      return this.$route.query.source || null
    },
    assetChain () {
      return getNativeAsset(this.asset)
    },
    assetFees () {
      return this.fees[this.activeNetwork]?.[this.activeWalletId]?.[
        this.assetChain
      ]
    },
    feesAvailable () {
      return this.assetFees && Object.keys(this.assetFees).length
    },
    isValidAddress () {
      return chains[cryptoassets[this.asset].chain].isValidAddress(this.address)
    },
    addressError () {
      if (!this.isValidAddress) {
        return 'Wrong format. Please check the address.'
      }
      return null
    },
    amountError () {
      const amount = BN(this.amount)
      if (amount.gt(this.available)) { return 'Lower amount. This exceeds available balance.' }
      return null
    },
    canSend () {
      if (!this.address || this.addressError) return false
      if (BN(this.amount).lte(0) || this.amountError) return false

      return true
    },
    txType () {
      return TX_TYPES.SEND
    },
    sendFee () {
      const feePrice = this.feesAvailable
        ? this.assetFees[this.selectedFee].fee
        : 0
      return getTxFee(this.assetChain, TX_TYPES.SEND, feePrice)
    },
    prettyFee () {
      return this.sendFee.dp(6)
    },
    available () {
      if (cryptoassets[this.asset].type === 'erc20') {
        return unitToCurrency(cryptoassets[this.asset], this.balance)
      } else {
        const fee = currencyToUnit(cryptoassets[this.assetChain], this.sendFee)
        const available = BN.max(BN(this.balance).minus(fee), 0)
        return unitToCurrency(cryptoassets[this.asset], available)
      }
    },
    amountInFiat () {
      return prettyFiatBalance(this.amount, this.fiatRates[this.asset])
    },
    totalFeeInFiat () {
      return prettyFiatBalance(this.sendFee, this.fiatRates[this.asset])
    },
    feeType () {
      return FEE_TYPES[this.assetChain]
    },
    includeFees () {
      return this.feeType === FEE_TYPES.BTC
    },
    selectedFeeLabel () {
      return getFeeLabel(this.selectedFee)
    },
    totalToSendInFiat () {
      const total = BN(this.amount).plus(BN(this.sendFee))
      return prettyFiatBalance(total, this.fiatRates[this.asset])
    },
    amountWithFee () {
      return BN(this.amount).plus(BN(this.sendFee))
    }
  },
  methods: {
    ...mapActions(['updateFees', 'sendTransaction']),
    prettyBalance,
    dpUI,
    prettyFiatBalance,
    getAssetIcon,
    getAssetColorStyle,
    shortenAddress,
    async send () {
      this.sendErrorMessage = ''
      this.loading = true
      if (this.account?.type.includes('ledger')) {
        this.signRequestModalOpen = true
      }

      try {
        const amountToSend = this.maxOptionActive ? this.available : this.amount

        const amount = currencyToUnit(cryptoassets[this.asset], amountToSend).toNumber()
        const fee = this.feesAvailable
          ? this.assetFees[this.selectedFee].fee
          : undefined

        await this.sendTransaction({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          asset: this.asset,
          to: this.address,
          accountId: this.account.id,
          amount,
          fee
        })

        this.$router.replace(`/accounts/${this.accountId}/${this.asset}`)
      } catch (error) {
        console.error(error)
        const { message } = error
        this.loading = false
        this.signRequestModalOpen = false
        this.sendErrorMessage = message || error
        this.sendErrorModalOpen = true
      }
    },
    toogleMaxAmount () {
      this.maxOptionActive = !this.maxOptionActive
      if (this.maxOptionActive) {
        this.amount = BN.min(
          BN(this.available),
          dpUI(this.available)
        )
      }
    },
    back () {
      this.showConfirm = false
    },
    closeSendErrorModal () {
      this.sendErrorModalOpen = false
      this.loading = false
    },
    closeSignRequestModal () {
      this.signRequestModalOpen = false
      this.loading = false
    }
  },
  created () {
    this.updateFees({ asset: this.assetChain })
  },
  watch: {
    selectedFee: {
      handler () {
        if (this.maxOptionActive) {
          this.amount = BN.min(
            BN(this.available),
            dpUI(this.available)
          )
        }
      },
      deep: true
    },
    amount: function (val) {
      const amount = BN(val)
      const available = dpUI(this.available)
      if (!amount.eq(available)) {
        this.maxOptionActive = false
      }
    }
  }
}
</script>

<style lang="scss">
.send {
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
    display: flex;
    align-items: center;
    font-weight: bold;
    margin: 6px 0;
    .fee-selector {
      margin-left: 6px;
    }

  }
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
