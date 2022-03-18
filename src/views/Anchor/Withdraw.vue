<template>
  <div class="withdraw">
    <NavBar showBack="true" :backPath="`/anchor/overview/${account.id}`" backLabel="Back">
      Withdraw
    </NavBar>

    <NoBalance v-if="!minimum" :label="'No UST in this account to make another deposit.'" />

    <div class="wrapper form">
      <PoweredByAnchor />

      <div class="wrapper_top">
        <SendInput
          :label="'You Withdraw Today'"
          :asset="asset"
          :amount="amount"
          :account="account"
          :available="depositedAmount"
          :maxFiat="maxFiat"
          :amount-fiat="amountFiat"
          :max-active="maxOptionActive"
          :max="depositedAmount"
          :max-fiat="prettyFiatBalance(depositedAmount, fiatRates[asset])"
          :amount-error="amountError"
          @update:amount="(newAmount) => (amount = newAmount)"
          @update:amountFiat="(amount) => (amountFiat = amount)"
          @toggle-max="toggleMaxAmount"
        />

        <TransactionFee :txFee="txFee" :asset="asset" />
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

import { mapGetters, mapState } from 'vuex'
import { unitToCurrency } from '@liquality/cryptoassets'
import { createAnchor, getDepositedAmount } from '@/utils/anchor'

import { getNativeAsset, getFeeAsset } from '@/utils/asset'
import { prettyFiatBalance, dpUI, fiatToCrypto } from '@/utils/coinFormatter'
import cryptoassets from '../../utils/cryptoassets'

import NavBar from '@/components/NavBar'
import SendInput from '../Send/SendInput.vue'
import NoBalance from './components/NoBalance.vue'
import DoubleButtons from './components/DoubleButtons'
import TransactionFee from './components/TransactionFee'
import PoweredByAnchor from './components/PoweredByAnchor'

export default {
  components: {
    NavBar,
    SendInput,
    NoBalance,
    DoubleButtons,
    TransactionFee,
    PoweredByAnchor
  },
  props: ['accountId'],
  data() {
    return {
      depositedAmount: 0,
      stateAmount: 0,
      stateAmountFiat: 0,
      maxOptionActive: true
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
    minimum() {
      return BN(this.balance).minus(this.txFeeUnits) > 0
    },
    maxFiat() {
      return prettyFiatBalance(this.depositedAmount, this.fiatRates[this.asset])
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
      if (amount.gt(this.depositedAmount)) {
        return 'Your withdrawal exceeds available total deposit. Must be < {000} UST (available total deposit minus fees). Use ‘Max’.'
      }
      return null
    },
    showNoBalance() {
      console.log(this.balance)
      return this.balance
    }
  },
  methods: {
    unitToCurrency,
    prettyFiatBalance,
    toggleMaxAmount() {
      this.maxOptionActive = !this.maxOptionActive

      if (this.maxOptionActive) {
        this.amount = BN.min(BN(this.depositedAmount), dpUI(this.depositedAmount))
      }
    }
  },
  async created() {
    createAnchor()
    this.depositedAmount = await getDepositedAmount()
    this.stateAmount = this.depositedAmount
    this.stateAmountFiat = prettyFiatBalance(this.stateAmount, this.fiatRates[this.asset])
  }
}
</script>

<style scoped lang="scss">
::v-deep .send-main-input {
  max-width: none !important;
}

::v-deep .text-right {
  text-align: left !important;
}

::v-deep .send-bottom {
  max-width: 234px !important;
}

.wrapper_top {
  margin-top: 20px;
}
</style>
