<template>
  <div class="send">
    <NavBar showBack="true" :backPath="`/account/${asset}`" :backLabel="asset">
      Send
    </NavBar>
    <div class="wrapper form">
      <div class="wrapper_top">
        <div class="form-group">
          <label for="amount">
            Send
            <span class="label-sub"><span class="text-muted">Available</span> {{balance}} {{asset}}</span>
            <span class="label-append">${{prettyFiatBalance(sendAmount, fiatRates[asset])}}</span>
          </label>
          <div class="input-group send_asset">
            <img :src="'./img/' + asset.toLowerCase() +'.png'" class="send_asset_icon" />
            <div class="input-group-append">
              <span class="input-group-text">{{asset}}</span>
            </div>
            <input type="text" :class="{ 'is-invalid': sendAmount && amountError }" :style="getAssetColorStyle(asset)" v-model="sendAmount" class="form-control" id="amount" placeholder="0.00" autocomplete="off" required>
          </div>
          <small v-if="sendAmount && amountError" class="text-danger form-text text-right">{{ amountError }}</small>
        </div>
        <div class="form-group">
          <label for="address">Send to</label>
          <div class="input-group">
            <input type="text" :class="{ 'is-invalid': sendAddress && addressError }" v-model="sendAddress" class="form-control form-control-sm" id="address" placeholder="Address" autocomplete="off" required>
          </div>
          <small v-if="sendAddress && addressError" class="text-danger form-text text-right">{{ addressError }}</small>
        </div>
      </div>

      <div class="wrapper_bottom">
        <div class="form-group" v-if="feesAvailable">
          <label>Network Speed/Fee</label>
          <div class="send_fees">
            {{ assetChain }}
            <FeeSelector :asset="asset" v-model="selectedFee" v-bind:fees="assetFees" />
          </div>
        </div>
        <div class="button-group">
          <router-link :to="`/account/${asset}`"><button class="btn btn-light btn-outline-primary btn-lg">Cancel</button></router-link>
          <button class="btn btn-primary btn-lg" @click="send" :disabled="!canSend">Review Terms</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import BN from 'bignumber.js'
import cryptoassets from '@liquality/cryptoassets'
import NavBar from '@/components/NavBar'
import FeeSelector from '@/components/FeeSelector'
import { prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import { getChainFromAsset, getAssetColorStyle } from '@/utils/asset'

export default {
  components: {
    NavBar,
    FeeSelector
  },
  data () {
    return {
      sendAmount: 0,
      sendAddress: null,
      selectedFee: 'average'
    }
  },
  props: {
    asset: String
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'balances', 'fees', 'fiatRates']),
    assetChain () {
      return getChainFromAsset(this.asset)
    },
    assetFees () {
      return this.fees[this.activeNetwork]?.[this.activeWalletId]?.[this.assetChain]
    },
    feesAvailable () {
      return this.assetFees && Object.keys(this.assetFees).length
    },
    isValidAddress () {
      return cryptoassets[this.asset.toLowerCase()].isValidAddress(this.sendAddress)
    },
    addressError () {
      if (!this.isValidAddress) return 'Wrong format. Please check the address.'
      return null
    },
    amountError () {
      const sendAmount = BN(this.sendAmount)
      if (sendAmount.gt(this.balance)) return 'Amount exceeds available balance.'
      if ((this.asset === 'ETH' || this.asset === 'BTC') && sendAmount.eq(this.balance)) return 'To account for the fee, lower this amount.'
      return null
    },
    canSend () {
      const sendAmount = BN(this.sendAmount)

      if (!this.sendAddress || this.addressError) return false
      if (sendAmount.lte(0) || this.amountError) return false

      return true
    },
    balance () {
      const rawBalance = this.balances[this.activeNetwork][this.activeWalletId][this.asset]
      return prettyBalance(rawBalance, this.asset)
    }
  },
  methods: {
    prettyBalance,
    prettyFiatBalance,
    getAssetColorStyle,
    ...mapActions(['updateFees']),
    async send () {
      const fee = this.feesAvailable ? this.assetFees[this.selectedFee].fee : undefined
      this.$router.push({
        name: 'SendConfirm',
        params: {
          asset: this.asset, sendAddress: this.sendAddress, sendAmount: this.sendAmount, fee
        }
      })
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
      width: 28px;
      height: 28px;
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
</style>
