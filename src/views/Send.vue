<template>
  <div>
    <div class="send" v-if="!showConfirm">
      <NavBar
        showBack="true"
        :backPath="`/account/${asset}`"
        :backLabel="asset"
      >
        Send
      </NavBar>
      <div class="wrapper form">
        <div class="wrapper_top">
          <div class="form-group">
            <span class="float-left">
              <label for="amount"> Send </label>
            </span>
            <span class="float-right label-append">
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
          <div class="form-group">
            <span class="label-sub float-left"
              ><span class="text-muted">Available</span> {{ available }}
              {{ asset }}</span
            >
            <div
              class="float-right btn-group btn-group-toggle"
              data-toggle="buttons"
            >
              <label
                class="btn btn-light btn-outline-dark btn-sm"
                @click="clickMaxAmount"
              >
                <input type="radio" name="maxAmount" autocomplete="off" /> Max
              </label>
            </div>
          </div>
          <div class="form-group">
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
        </div>

        <div class="wrapper_bottom">
          <div class="form-group" v-if="feesAvailable">
            <label>Network Speed/Fee</label>
            <div class="send_fees">
              {{ assetChain }}
              <FeeSelector
                :asset="assetChain"
                v-model="selectedFee"
                v-bind:fees="assetFees"
                v-bind:txTypes="[txType]"
              />
            </div>
          </div>
          <div class="button-group">
            <router-link :to="`/account/${asset}`"
              ><button class="btn btn-light btn-outline-primary btn-lg">
                Cancel
              </button></router-link
            >
            <button
              class="btn btn-primary btn-lg"
              @click="showConfirm = true"
              :disabled="!canSend"
            >
              Review Terms
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="send-confirm wrapper form text-center" v-if="showConfirm">
      <div class="wrapper_top form">
        <div class="form-group">
          <label> Send <span class="text-muted">(INCL FEES)</span> </label>
          <p class="confirm-value" :style="getAssetColorStyle(asset)">
            {{ amountToSend }} {{ asset }}
          </p>
          <p class="text-muted">${{ amountToSendInFiat }}</p>
        </div>
        <div class="form-group">
          <label>Send To</label>
          <p class="confirm-value">{{ shortenAddress(this.address) }}</p>
        </div>
      </div>
    
      <div class="wrapper_bottom">
        <div class="details-container">
          <div class="details-header" @click.stop="showDetails = !showDetails">
            <ChevronDownIcon v-if="showDetails"/>
            <ChevronUpIcon v-else/>
            &nbsp; DETAILS
          </div>
          <ul class="details-list" v-if="showDetails">
            <li><label>Send</label></li>
            <li>
              <span class="text-muted">
                AMOUNT:&nbsp;{{ amountToSend }} {{ assetChain }} /
                {{ amountToSendInFiat }}</span
              >
            </li>
            <li>
              <span class="text-muted"
                >NETWORK FEES:&nbsp; {{ totalFee }} / (${{
                  prettyFiatBalance(totalFee, fiatRates[assetChain])
                }})
              </span>
            </li>
          </ul>
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
</template>

<script>
import { mapState, mapActions } from 'vuex'
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
import { TX_TYPES, getTxFee } from '@/utils/fees'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ChevronUpIcon from '@/assets/icons/chevron_up.svg'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'

export default {
  components: {
    NavBar,
    FeeSelector,
    SpinnerIcon,
    ChevronUpIcon,
    ChevronDownIcon
  },
  data () {
    return {
      amount: 0,
      address: null,
      selectedFee: 'average',
      showConfirm: false,
      loading: false,
      showDetails: true
    }
  },
  props: {
    asset: String
  },
  computed: {
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'balances',
      'fees',
      'fiatRates'
    ]),
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
      if (!this.isValidAddress) { return 'Wrong format. Please check the address.' }
      return null
    },
    amountError () {
      const amount = BN(this.amount)
      if (amount.gt(this.available)) return 'Lower amount. This exceeds your available balance.'
      return null
    },
    canSend () {
      const amount = BN(this.amount)

      if (!this.address || this.addressError) return false
      if (amount.lte(0) || this.amountError) return false

      return true
    },
    txType () {
      return TX_TYPES.SEND
    },
    totalFee () {
      const feePrice = this.feesAvailable
        ? this.assetFees[this.selectedFee].fee
        : 0
      const sendFee = getTxFee(this.assetChain, TX_TYPES.SEND, feePrice)
      return sendFee
    },
    available () {
      const balance = this.balances[this.activeNetwork][this.activeWalletId][
        this.asset
      ]
      const fee = cryptoassets[this.assetChain].currencyToUnit(this.totalFee)
      const available =
        this.assetChain !== this.asset
          ? BN(balance)
          : BN.max(BN(balance).minus(fee), 0)
      return prettyBalance(available, this.asset)
    },
    amountToSend () {
      return BN(this.amount).plus(BN(this.totalFee))
    },
    amountToSendInFiat () {
      return prettyFiatBalance(this.amountToSend, this.fiatRates[this.asset])
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
        amount,
        fee
      })

      this.$router.replace(`/account/${this.asset}`)
    },
    clickMaxAmount () {
      this.amount = this.available
    }
  },
  created () {
    this.updateFees({ asset: this.asset })
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
