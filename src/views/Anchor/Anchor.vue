<template>
  <div class="earn">
    <div>
      <NavBar
        showBack="true"
        :backPath="routeSource === 'assets' ? '/wallet' : `/accounts/${account.id}/${asset}`"
        backLabel="Back"
      >
        Earn
      </NavBar>
    </div>
    <div class="wrapper">
      <div class="powered-by">
        <span>powered by</span>
        <div>
          <span><strong>ANCHOR</strong> EARN</span>
        </div>
      </div>
      <div class="amounts-wrapper">
        <div class="left-label">
          <strong>YOUR TOTAL DEPOSIT</strong>
        </div>
        <div class="right-label">
          <span class="amount">321.321321</span>

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
      <div class="available">
        <div class="send-bottom-available" id="send_available_balance">
          <span class="text-muted">Available</span>
          {{ isNaN(balance) ? '0' : dpUI(balance) || '0' }} {{ asset }}
        </div>
      </div>
      <div class="amounts-wrapper">
        <div class="left-label">
          <strong>EXPECTED INTEREST RATE</strong>
        </div>
        <div class="right-label">
          <span class="amount">321.321321</span>

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
      <div class="apy-wrapper">
        <p
          v-bind:class="{ active: selectedInterestRate === 'year' }"
          v-on:click="updateSelectedInterestRate('year')"
        >
          Year
        </p>
        <p
          v-bind:class="{ active: selectedInterestRate === 'month' }"
          v-on:click="updateSelectedInterestRate('month')"
        >
          Month
        </p>
        <p
          v-bind:class="{ active: selectedInterestRate === 'week' }"
          v-on:click="updateSelectedInterestRate('week')"
        >
          Week
        </p>
        <p
          v-bind:class="{ active: selectedInterestRate === 'day' }"
          v-on:click="updateSelectedInterestRate('day')"
        >
          Day
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { getAssetIcon } from '@/utils/asset'
import { createAnchor, getApy, getDepositedAmount, makeDeposit, makeWithdraw } from '@/utils/anchor'
import { dpUI } from '@/utils/coinFormatter'
import { unitToCurrency } from '@liquality/cryptoassets'
import cryptoassets from '@/utils/cryptoassets'

import NavBar from '@/components/NavBar'
import AccountTooltip from '@/components/AccountTooltip'

export default {
  components: {
    NavBar,
    AccountTooltip
  },
  props: ['accountId'],
  data() {
    return {
      apy: null,
      depositedAmount: null,
      depositAmount: 0,
      withdrawAmount: 0,
      selectedInterestRate: 'year'
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
    updateSelectedInterestRate(period) {
      this.selectedInterestRate = period
    },
    async deposit() {
      await makeDeposit(this.depositAmount)
    },
    async withdraw() {
      await makeWithdraw(this.withdrawAmount)
    }
  },
  async created() {
    createAnchor()
    const [apy, depositedAmount] = await Promise.all([getApy(), getDepositedAmount()])

    this.apy = apy
    this.depositedAmount = depositedAmount
  }
}
</script>

<style lang="scss">
.wrapper {
  display: flex;
  flex: 1;
  padding: 20px;
  flex-direction: column;

  .powered-by {
    display: flex;
    align-self: flex-end;
    font-size: 10px;

    div {
      background: #d9dfe5;
      border-radius: 12px;
      width: 115px;
      height: 17px;
      text-align: center;
      margin-left: 8px;
    }
  }

  .amounts-wrapper {
    margin-top: 26px;
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

  .apy-wrapper {
    margin-top: 14px;
    border: 1px solid #d9dfe5;
    border-radius: 26px;
    width: 232px;
    height: 26px;
    align-self: flex-end;
    text-align: center;
    display: flex;

    p {
      height: 24px;
      width: 58px;
      margin-bottom: 0;
      padding-top: 3px;
      cursor: pointer;

      &:nth-child(1),
      &:nth-child(2),
      &:nth-child(3) {
        border-right: 1px solid #d9dfe5;
      }

      &:nth-child(1) {
        border-top-left-radius: 26px;
        border-bottom-left-radius: 26px;
      }

      &:nth-child(4) {
        border-top-right-radius: 26px;
        border-bottom-right-radius: 26px;
      }
    }

    .active {
      background: #f0f7f9;
      font-weight: bold;
    }
  }
}
</style>

//
<div>
//       <p>APY: {{ apy }}</p>
//     </div>
//
<div>
//       <p>Total Deposit: {{ depositedAmount }} UST</p>
//     </div>
//
<div>
//       <p>Balance: {{ balance }}</p>
//     </div>
//
<div>
//       <p>Deposit</p>
//       <input v-model="depositAmount" />
//       <button v-on:click="deposit">Do it</button>
//     </div>
//
<div>
//       <p>Withdraw</p>
//       <input v-model="withdrawAmount" />
//       <button v-on:click="withdraw">Do it</button>
//     </div>
