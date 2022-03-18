<template>
  <div class="overview">
    <div>
      <NavBar showBack="true" :backPath="`/accounts/${account.id}/${asset}`" backLabel="Back">
        EARN
      </NavBar>
    </div>

    <NoBalance
      v-if="!balance.toNumber()"
      :label="'No UST in this account. Receive or buy UST to be able to make a deposit, and start earning.'"
    />

    <div class="wrapper">
      <PoweredByAnchor @setGettingStarted="setGettingStarted" />
      <div class="amounts-wrapper">
        <div class="left-label">
          <strong>YOUR TOTAL DEPOSIT</strong>
        </div>
        <div class="right-label">
          <span class="amount">
            {{ isNaN(depositedAmount) ? '0' : dpUI(depositedAmount) || '0' }}
          </span>

          <AccountTooltip :account="account" :asset="asset">
            <div class="send-main-icon">
              <img :src="getAssetIcon(asset)" class="asset-icon" />
              <span class="asset-name">
                {{ asset }}
              </span>
            </div>
          </AccountTooltip>
        </div>
      </div>
      <Available :asset="asset" :amount="balance" />

      <ExpectedInterestRate :asset="asset" :account="account" :amount="depositedAmount" />

      <div v-if="!depositedAmount" class="no-deposit">
        <p>
          Once you start using staking you will see your total deposit and interest rate here, and
          will be able to withdraw it anytime.
        </p>
        <p
          v-bind:class="{ disabled: !balance.toNumber() }"
          @click="!balance.toNumber() ? () => '' : $router.push(`/anchor/deposit/${accountId}`)"
        >
          Make Your First Deposit
        </p>
      </div>

      <DoubleButtons
        v-else
        :firstButtonLabel="'Withdraw'"
        :secondButtonLabel="'Deposit'"
        @firstButtonHandler="$router.push(`/anchor/withdraw/${accountId}`)"
        @secondButtonHandler="$router.push(`/anchor/deposit/${accountId}`)"
      />
    </div>

    <GettingStarted v-if="gettingStarted" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { getAssetIcon } from '@/utils/asset'
import { createAnchor, getDepositedAmount } from '@/utils/anchor'
import { dpUI } from '@/utils/coinFormatter'
import { unitToCurrency } from '@liquality/cryptoassets'
import cryptoassets from '@/utils/cryptoassets'

import NavBar from '@/components/NavBar'
import Available from './components/Available'
import NoBalance from './components/NoBalance'
import DoubleButtons from './components/DoubleButtons'
import GettingStarted from './components/GettingStarted'
import AccountTooltip from '@/components/AccountTooltip'
import PoweredByAnchor from './components/PoweredByAnchor'
import ExpectedInterestRate from './components/ExpectedInterestRate'

export default {
  components: {
    NavBar,
    AccountTooltip,
    ExpectedInterestRate,
    PoweredByAnchor,
    Available,
    NoBalance,
    DoubleButtons,
    GettingStarted
  },
  props: ['accountId'],
  data() {
    return {
      depositedAmount: null,
      loading: true,
      gettingStarted: false
    }
  },
  computed: {
    ...mapGetters(['accountItem']),
    asset() {
      return 'UST'
    },
    account() {
      return this.accountItem(this.accountId)
    },
    balance() {
      const balance = this.account.balances[this.asset] || 0

      return unitToCurrency(cryptoassets[this.asset], balance)
    }
  },
  methods: {
    getAssetIcon,
    dpUI,
    setGettingStarted() {
      this.gettingStarted = !this.gettingStarted
    }
  },
  async created() {
    createAnchor()
    this.depositedAmount = await getDepositedAmount()
    this.loading = false
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex: 1;
  padding: 20px;
  flex-direction: column;

  .amounts-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;

    .left-label {
      width: 130px;
    }

    .right-label {
      display: flex;
      align-items: center;
    }

    .amount {
      font-size: 24px;
      line-height: 24px;
      color: #5291f1;
    }

    .send-main-icon {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-left: 10px;

      .asset-name {
        margin-left: 5px;
        font-style: normal;
        font-weight: 300;
        font-size: 24px;
        line-height: 24px;
      }

      div {
        display: flex;
        align-items: center;
        height: 24px;

        svg {
          width: 8px;
          margin-left: 10px;
          vertical-align: middle;
        }
      }
    }
  }

  .available {
    text-align: end;
    margin-top: 5px;

    .send-bottom-available {
      line-height: 15px;
      text-transform: none;
      font-weight: $font-weight-light;
      font-size: $font-size-tiny;
    }
  }

  .no-deposit {
    margin-top: 20px;
    display: flex;
    flex-direction: column;

    p {
      margin-bottom: 0;

      &:nth-child(2) {
        color: white;
        text-align: center;
        background-color: #9d4dfa;
        margin-top: 125px;
        width: 229.35px;
        height: 36px;
        border-radius: 22px;
        align-self: center;
        font-weight: 600;
        font-size: 14px;
        line-height: 17.07px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
      }

      &.disabled {
        opacity: 0.3;
        cursor: not-allowed;
        margin-top: 34px;
      }
    }
  }
}
</style>
