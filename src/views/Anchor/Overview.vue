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
      <!-- <PoweredByAnchor @setGettingStarted="setGettingStarted" /> -->
      <div class="amounts-wrapper">
        <div class="left-label">
          <p>ALREADY DEPOSITED</p>
        </div>
        <div class="right-label">
          <span class="text-muted">$ {{ fiatBalance }}</span>
          <div class="amount-wrapper">
            <span>
              {{ isNaN(depositedAmount) ? '0' : dpUI(depositedAmount) || '0' }}
            </span>

            <span class="asset">
              {{ asset }}
            </span>
          </div>
        </div>
      </div>
      <Available :asset="asset" :amount="balance" />

      <ExpectedInterestRate :asset="asset" :account="account" :amount="depositedAmount" />

      <div class="activities">
        <span @click="setShowActivities"
          ><i class="arrow" v-bind:class="{ right: !showActivities, bottom: showActivities }"></i> 3
          ACTIVITIES
        </span>
        <div class="list">
          <div class="item">
            <div class="left-wrapper">
              <div>NQKAV ICON</div>
              <div>
                <span>DEPOSIT UST</span>
                <span>4/27/2022, 6:51pm</span>
              </div>
            </div>
            <div class="right-wrapper">
              <div>
                <span>DEPOSIT UST</span>
                <span>4/27/2022, 6:51pm</span>
              </div>
              <div>NQKAV ICON</div>
            </div>
          </div>
          <div class="item">
            <div class="left-wrapper">
              <div>NQKAV ICON</div>
              <div>
                <span>DEPOSIT UST</span>
                <span>4/27/2022, 6:51pm</span>
              </div>
            </div>
            <div class="right-wrapper">
              <div>
                <span>DEPOSIT UST</span>
                <span>4/27/2022, 6:51pm</span>
              </div>
              <div>NQKAV ICON</div>
            </div>
          </div>
          <div class="item">
            <div class="left-wrapper">
              <div>NQKAV ICON</div>
              <div>
                <span>DEPOSIT UST</span>
                <span>4/27/2022, 6:51pm</span>
              </div>
            </div>
            <div class="right-wrapper">
              <div>
                <span>DEPOSIT UST</span>
                <span>4/27/2022, 6:51pm</span>
              </div>
              <div>NQKAV ICON</div>
            </div>
          </div>
        </div>
      </div>

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

    <GettingStarted
      v-if="gettingStarted"
      :accountId="accountId"
      @setGettingStarted="setGettingStarted"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import { getAssetIcon } from '@/utils/asset'
import { createAnchor, getDepositedAmount } from '@/utils/anchor'
import { dpUI, prettyFiatBalance } from '@/utils/coinFormatter'
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
      depositedAmount: 0,
      loading: true,
      gettingStarted: false,
      showActivities: false
    }
  },
  computed: {
    ...mapGetters(['accountItem']),
    ...mapState(['fiatRates']),
    asset() {
      return 'UST'
    },
    account() {
      return this.accountItem(this.accountId)
    },
    balance() {
      const balance = this.account.balances[this.asset] || 0

      return unitToCurrency(cryptoassets[this.asset], balance)
    },
    fiatBalance() {
      return prettyFiatBalance(this.balance, this.fiatRates[this.asset])
    }
  },
  methods: {
    getAssetIcon,
    dpUI,
    prettyFiatBalance,
    setGettingStarted() {
      this.gettingStarted = !this.gettingStarted
    },
    setShowActivities() {
      this.showActivities = !this.showActivities
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

  .expected-interest-wrapper {
    margin-top: 15px;
  }

  .amounts-wrapper {
    display: flex;
    justify-content: space-between;

    .left-label {
      font-size: 12px;
      line-height: 16px;
      font-weight: 700;

      p {
        width: 200px;
      }
    }

    .right-label {
      display: flex;
      align-items: flex-end;
      flex-direction: column;
    }

    .amount-wrapper {
      display: flex;
      color: #646f85;
      font-size: 28px;
      line-height: 42px;

      .asset {
        font-weight: 300;
        margin-left: 7px;
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

  .activities {
    margin-top: 45px;
    font-weight: 700;
    cursor: pointer;

    .arrow {
      border: solid #3d4767;
      border-width: 0 2px 2px 0;
      display: inline-block;
      padding: 3px;
      margin-right: 9px;

      &.right {
        transform: rotate(-45deg);
      }

      &.bottom {
        transform: rotate(45deg);
      }
    }

    .list {
      .item {
        display: flex;
        justify-content: space-between;

        .left-wrapper,
        .right-wrapper {
          display: flex;
        }
      }
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

::v-deep .amount {
  font-size: 28px !important;
  line-height: 42px !important;
}
</style>
