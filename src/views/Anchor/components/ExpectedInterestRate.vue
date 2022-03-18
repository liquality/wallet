<template>
  <div class="expected-interest-wrapper">
    <div class="amounts-wrapper">
      <div class="left-label">
        <strong>EXPECTED INTEREST RATE</strong>
      </div>
      <div class="right-label">
        <span class="amount">{{ expectedInterestRate }}</span>

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
        @click="updateSelectedInterestRate('year')"
      >
        Year
      </p>
      <p
        v-bind:class="{ active: selectedInterestRate === 'month' }"
        @click="updateSelectedInterestRate('month')"
      >
        Month
      </p>
      <p
        v-bind:class="{ active: selectedInterestRate === 'week' }"
        @click="updateSelectedInterestRate('week')"
      >
        Week
      </p>
      <p
        v-bind:class="{ active: selectedInterestRate === 'day' }"
        @click="updateSelectedInterestRate('day')"
      >
        Day
      </p>
    </div>
    <div class="apy-today">
      <p>
        <strong>APY {{ apy }} % AS OF TODAY</strong>
      </p>
    </div>
  </div>
</template>

<script>
import { getApy } from '@/utils/anchor'
import { getAssetIcon } from '@/utils/asset'
import { dpUI } from '@/utils/coinFormatter'

import AccountTooltip from '@/components/AccountTooltip'

export default {
  props: ['asset', 'account', 'amount'],
  components: {
    AccountTooltip
  },
  data() {
    return {
      selectedInterestRate: 'year',
      apy: 0
    }
  },
  computed: {
    expectedInterestRate() {
      const divider = this.divideBy(this.selectedInterestRate)
      const interestRate = (this.amount / 100) * this.apy

      return dpUI(interestRate / divider)
    }
  },
  methods: {
    getAssetIcon,
    dpUI,
    updateSelectedInterestRate(period) {
      this.selectedInterestRate = period
    },
    divideBy(selectedInterestRate) {
      return {
        year: 1,
        month: 12,
        week: 52,
        day: 365
      }[selectedInterestRate]
    }
  },
  async created() {
    this.apy = await getApy()
  }
}
</script>

<style lang="scss">
.expected-interest-wrapper {
  display: flex;
  flex-direction: column;
}
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

.apy-today {
  align-self: flex-end;
  margin-top: 19px;
}
</style>
