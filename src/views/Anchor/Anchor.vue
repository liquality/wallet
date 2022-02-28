<template>
  <div>
    <div>
      <p>APY: {{ apy }}</p>
    </div>
    <div>
      <p>Total Deposit: {{ depositedAmount }} UST</p>
    </div>
    <div>
      <p>Balance: {{ balance }}</p>
    </div>
    <div>
      <p>Deposit</p>
      <input v-model="depositAmount" />
      <button v-on:click="deposit">Do it</button>
    </div>
    <div>
      <p>Withdraw</p>
      <input v-model="withdrawAmount" />
      <button v-on:click="withdraw">Do it</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  createAnchor,
  getApy,
  getDepositedAmount,
  makeDeposit,
  makeWithdraw
} from '../../utils/anchor'

export default {
  props: ['accountId'],
  data() {
    return {
      apy: null,
      depositedAmount: null,
      depositAmount: 0,
      withdrawAmount: 0
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
      return this.account.balances[this.asset] || 0
    }
  },
  methods: {
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
