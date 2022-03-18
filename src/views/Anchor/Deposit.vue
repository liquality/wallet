<template>
  <div class="deposit">
    <NavBar showBack="true" :backPath="`/anchor/overview/${account.id}`" backLabel="Back">
      MAKE A DEPOSIT
    </NavBar>

    <NoBalance v-if="!available" :label="'No UST in this account to make another deposit.'" />

    <div class="wrapper form">
      <PoweredByAnchor />

      <div class="wrapper_top">
        <SendInput
          :label="'You Deposit Today'"
          :asset="asset"
          :amount="amount"
          :account="account"
          :available="available"
          :maxFiat="maxFiat"
          :amount-fiat="amountFiat"
          :max-active="maxOptionActive"
          :max="available"
          :max-fiat="prettyFiatBalance(available, fiatRates[asset])"
          :amount-error="amountError"
          @update:amount="(newAmount) => (amount = newAmount)"
          @update:amountFiat="(amount) => (amountFiat = amount)"
          @toggle-max="toggleMaxAmount"
        />

        <TransactionFee :txFee="txFee" :asset="asset" />

        <ExpectedInterestRate :asset="asset" :account="account" :amount="amount" />
      </div>

      <DoubleButtons
        :firstButtonLabel="'Cancel'"
        :secondButtonLabel="'Review Deposit'"
        @firstButtonHandler="$router.push(`/anchor/overview/${accountId}`)"
        @secondButtonHandler="() => ''"
      />
    </div>
  </div>
</template>
<script>
import BN from 'bignumber.js'

import { mapGetters, mapState, mapActions } from 'vuex'

import { unitToCurrency } from '@liquality/cryptoassets'

import { getNativeAsset, getFeeAsset } from '@/utils/asset'
import { prettyFiatBalance, dpUI, fiatToCrypto } from '@/utils/coinFormatter'
import cryptoassets from '../../utils/cryptoassets'

import NavBar from '@/components/NavBar'
import SendInput from '../Send/SendInput.vue'
import NoBalance from './components/NoBalance.vue'
import DoubleButtons from './components/DoubleButtons'
import TransactionFee from './components/TransactionFee'
import PoweredByAnchor from './components/PoweredByAnchor'
import ExpectedInterestRate from './components/ExpectedInterestRate'

export default {
  components: {
    NavBar,
    SendInput,
    NoBalance,
    DoubleButtons,
    TransactionFee,
    PoweredByAnchor,
    ExpectedInterestRate
  },
  props: ['accountId'],
  data() {
    return {
      stateAmount: 0,
      stateAmountFiat: 0,
      maxOptionActive: false
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'fees', 'fiatRates']),
    ...mapGetters(['accountItem']),
    account() {
      return this.accountItem(this.accountId)
    },
    asset() {
      return 'UST'
    },
    balance() {
      return this.account.balances[this.asset] || 0
    },
    assetChain() {
      return getFeeAsset(this.asset) || getNativeAsset(this.asset)
    },
    txFeeUnits() {
      const feePrice =
        this.fees[this.activeNetwork]?.[this.activeWalletId]?.[this.assetChain]?.slow.fee
      const txFeeUnits = 1_000_000 // 1 milion gas used by anchor

      return BN(txFeeUnits).times(feePrice)
    },
    txFee() {
      return unitToCurrency(cryptoassets[this.asset], this.txFeeUnits)
    },
    available() {
      const available = BN(this.balance).minus(this.txFeeUnits)

      return unitToCurrency(cryptoassets[this.asset], available)
    },
    maxFiat() {
      return prettyFiatBalance(this.available, this.fiatRates[this.asset])
    },
    amount: {
      get() {
        return this.stateAmount
      },
      set(newValue) {
        if (newValue && !isNaN(newValue)) {
          this.stateAmount = newValue
        } else {
          this.stateAmount = 0.0
        }
        this.stateAmountFiat = prettyFiatBalance(this.stateAmount, this.fiatRates[this.asset])
      }
    },
    amountFiat: {
      get() {
        return this.stateAmountFiat
      },
      set(newValue) {
        if (!newValue) {
          // keep it as a number instead of string, otherwise the placeholder of input won't appear
          this.stateAmountFiat = 0.0
          this.stateAmount = 0.0
        } else {
          this.stateAmountFiat = newValue
          this.stateAmount = fiatToCrypto(
            this.stateAmountFiat?.replaceAll(',', ''),
            this.fiatRates[this.asset]
          )
        }
      }
    },
    amountError() {
      const amount = BN(this.amount)
      if (amount.gt(this.available)) {
        return 'Your deposit exceeds available funds. Must be < {000} UST (available balance minus fees). Use ‘Max’.'
      }
      return null
    }
  },
  methods: {
    ...mapActions(['updateFees']),
    unitToCurrency,
    prettyFiatBalance,
    toggleMaxAmount() {
      this.maxOptionActive = !this.maxOptionActive

      if (this.maxOptionActive) {
        this.amount = BN.min(BN(this.available), dpUI(this.available))
      }
    }
  },
  watch: {
    amount: function (val) {
      const amount = BN(val)
      const available = dpUI(this.available)

      if (!amount.eq(available)) {
        this.maxOptionActive = false
      }
    }
  },
  async created() {
    console.log(this.assetChain)
    await this.updateFees({ asset: this.assetChain })
    this.stateAmount = this.available.div(2)
    this.stateAmountFiat = prettyFiatBalance(this.stateAmount, this.fiatRates[this.asset])
  }
}
</script>

<style lang="scss" scoped>
.deposit {
  flex: 1;
}

::v-deep .no-balance {
  height: 74px;
}

::v-deep .text-right {
  text-align: left !important;
}

::v-deep .send-main-input {
  max-width: none !important;
}

::v-deep .send-bottom {
  max-width: 234px !important;
}

::v-deep .send-top-label {
  width: 94px !important;
}

.wrapper_top {
  margin-top: 20px;
}

.expected-interest-wrapper {
  margin-bottom: 108px;
}
</style>
