<template>
  <div>
    <div class="send" v-if="!showConfirm">
      <NavBar
        showBack="true"
        :backPath="routeSource === 'assets' ? '/wallet' : `/account/${this.account.id}/${this.asset}`"
        :backLabel="routeSource === 'assets' ? 'Overview' : asset"
      >
        Send
      </NavBar>
      <div class="wrapper form">
        <div class="wrapper_top">
          <div class="form-group">
            <span class="float-left">
              <label for="amount"> Send </label>
            </span>
            <span class="float-right label-append text-muted">
              ${{ prettyFiatBalance(amount, fiatRates[asset]) }}
            </span>
            <div class="input-group send_asset">
              <img
                :src="getAssetIcon(asset)"
                class="asset-icon send_asset_icon"
              />
              <div class="input-group-append">
                <span class="input-group-text">{{ asset }}</span>
              </div>
              <input
                type="number"
                max="available"
                min="0"
                :class="{ 'is-invalid': amount && amountError }"
                :style="getAssetColorStyle(asset)"
                v-model="amount"
                class="form-control"
                id="amount"
                placeholder="0.00"
                autocomplete="off"
                required
              />
            </div>
            <small
              v-if="amount && amountError"
              class="text-danger form-text text-right"
              >{{ amountError }}</small
            >
          </div>
          <div class="sub-form-group">
            <div class="label-sub"
              ><span class="text-muted">Available</span> {{ available }}
              {{ asset }}</div
            >
            <div
              class="btn-group btn-group-toggle"
              data-toggle="buttons"
            >
              <button
                class="btn btn-option"
                :class="{ active: (available == amount) }"
                @click="setMaxAmount"
              >
                Max
              </button>
            </div>
          </div>
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
                ({{ selectedFeeLabel }} / {{ totalFee }} {{ feeType }})
              </span>
            </template>
            <template v-slot:content>
              <ul class="selectors">
                <li>
                  <div class="send_fees">
                    <span class="selectors-asset">{{ assetChain }}</span>
                    <FeeSelector
                      :asset="assetChain"
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
            <router-link :to="routeSource === 'assets' ? '/wallet' : `/account/${asset}`"
              ><button class="btn btn-light btn-outline-primary btn-lg">
                Cancel
              </button></router-link
            >
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
            {{ amount }} {{ asset }}
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
            ~{{ totalFee }} {{ feeType }}
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
              {{ amountWithFee }} {{ asset }}
            </div>
             <div class="font-weight-bold" v-else>
              {{ amount }} {{ asset }} + {{ totalFee }} {{ feeType }}
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
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import BN from 'bignumber.js'
import cryptoassets from '@/utils/cryptoassets'
import NavBar from '@/components/NavBar'
import FeeSelector from '@/components/FeeSelector'
import { prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
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
import SpinnerIcon from '@/assets/icons/spinner.svg'
import DetailsContainer from '@/components/DetailsContainer'

export default {
  components: {
    NavBar,
    FeeSelector,
    SpinnerIcon,
    DetailsContainer
  },
  data () {
    return {
      amount: 0,
      address: null,
      selectedFee: 'average',
      showConfirm: false,
      loading: false
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
    balance () {
      return this.account.balances[this.asset] || 0
    },
    routeSource () {
      return this.$route.query.source || null
    },
    assetChain () {
      return getChainFromAsset(this.asset)
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
      return cryptoassets[this.asset].isValidAddress(this.address)
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
    totalFee () {
      return this.sendFee.toString().substring(0, 8)
    },
    available () {
      const fee = cryptoassets[this.assetChain].currencyToUnit(this.totalFee)
      if (this.assetChain !== this.asset) {
        const available = BN.max(BN(this.balance).minus(fee), 0)
        return prettyBalance(BN(available), this.asset)
      } else {
        return prettyBalance(BN(this.balance), this.asset)
      }
    },
    amountInFiat () {
      return prettyFiatBalance(this.amount, this.fiatRates[this.asset])
    },
    totalFeeInFiat () {
      return prettyFiatBalance(this.totalFee, this.fiatRates[this.asset])
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
      return BN(this.amount).plus(BN(this.totalFee))
    }
  },
  methods: {
    ...mapActions(['updateFees', 'sendTransaction']),
    prettyBalance,
    prettyFiatBalance,
    getAssetIcon,
    getAssetColorStyle,
    shortenAddress,
    async send () {
      const amount = cryptoassets[this.asset]
        .currencyToUnit(this.amount)
        .toNumber()
      const fee = this.feesAvailable
        ? this.assetFees[this.selectedFee].fee
        : undefined

      this.loading = true
      await this.sendTransaction({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        asset: this.asset,
        to: this.address,
        accountId: this.account.id,
        amount,
        fee
      })

      this.$router.replace(`/account/${this.accountId}/${this.asset}`)
    },
    setMaxAmount () {
      this.amount = this.available
    },
    back () {
      this.showConfirm = false
    }
  },
  created () {
    this.updateFees({ asset: this.assetChain })
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
