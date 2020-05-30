<template>
  <div class="account">
    <div class="account_header">
      <img :src="'./img/' + asset.toLowerCase() +'.png'" />{{asset}}
    </div>
    <div class="account_main">
      <div class="account_top">
        <div class="account_balance">
          <span class="account_balance_value">{{balance}}</span>
          <span class="account_balance_code">{{asset}}</span>
        </div>
        <div class="account_actions">
          <router-link to="/account/btc/send"><button class="account_actions_button"><SendIcon class="account_actions_button_icon" /></button></router-link>
          <router-link to="/account/btc/receive"><button class="account_actions_button"><ReceiveIcon class="account_actions_button_icon" /></button></router-link>
          <router-link to="/account/btc/swap"><button class="account_actions_button"><SwapIcon class="account_actions_button_icon account_actions_button_swap" /></button></router-link>
        </div>
        <div class="account_title">Transactions</div>
      </div>
      <div class="account_transactions">
        <Transaction asset="BTC" v-bind:amount="0.252932" type="send" title="Send BTC" v-bind:timestamp="1589147122" v-bind:confirmed="true" />
        <Transaction asset="BTC" v-bind:amount="0.04522" type="receive" title="Receive BTC" v-bind:timestamp="1589147004" v-bind:confirmed="false" />
        <Transaction asset="BTC" v-bind:amount="0.01092" type="swap" title="Swap BTC to ETH" v-bind:timestamp="1589123946" v-bind:confirmed="false" v-bind:step="1" v-bind:numSteps="3" />
        <Transaction asset="BTC" v-bind:amount="0.252932" type="send" title="Send BTC" v-bind:timestamp="1589147122" v-bind:confirmed="true" />
        <Transaction asset="BTC" v-bind:amount="0.252932" type="send" title="Send BTC" v-bind:timestamp="1589147122" v-bind:confirmed="true" />
        <Transaction asset="BTC" v-bind:amount="0.04522" type="receive" title="Receive BTC" v-bind:timestamp="1589147004" v-bind:confirmed="true" />
        <Transaction asset="BTC" v-bind:amount="0.252932" type="send" title="Send BTC" v-bind:timestamp="1589147122" v-bind:confirmed="true" />
        <Transaction asset="BTC" v-bind:amount="0.252932" type="send" title="Send BTC" v-bind:timestamp="1589147122" v-bind:confirmed="true" />
        <Transaction asset="BTC" v-bind:amount="0.252932" type="send" title="Send BTC" v-bind:timestamp="1589147122" v-bind:confirmed="true" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import SendIcon from '@/assets/icons/arrow_send.svg'
import ReceiveIcon from '@/assets/icons/arrow_receive.svg'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import Transaction from '@/components/v2/Transaction'
import { prettyBalance } from '@/utils/coinFormatter'

export default {
  components: {
    SendIcon,
    ReceiveIcon,
    SwapIcon,
    Transaction
  },
  props: ['asset'],
  computed: {
    ...mapState(['activeNetwork', 'balances', 'activeWalletId']),
    balance () {
      console.log('asset', this.asset)
      if (!this.balances[this.activeNetwork]) return false
      if (!this.balances[this.activeNetwork][this.activeWalletId]) return false
      if (!this.balances[this.activeNetwork][this.activeWalletId][this.asset]) return false

      return prettyBalance(this.balances[this.activeNetwork][this.activeWalletId][this.asset], this.asset)
    }
  },
  methods: {
    ...mapActions(['updateBalances'])
  },
  async created () {
    console.log(this.balances)
  }
}
</script>

<style lang="scss">
.account {
  display: flex;
  flex-direction: column;
  flex: 1;

  &_header {
    display: flex;
    height: 56px;
    align-items: center;
    justify-content: center;
    font-size: $h2-font-size;
    border-bottom: 1px solid $hr-border-color;

    img {
      width: 24px;
      margin-right: 4px;
    }
  }

  &_main {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &_top {
    background: $brand-gradient-primary;
    color: $color-text-secondary;
    border-bottom: 1px solid #41DCCB;
  }

  &_balance {
    display: flex;
    height: 75px;
    align-items: flex-end;
    justify-content: center;

    &_value {
      line-height: 36px;
      font-size: 50px;
      margin-right: 8px;
    }

    &_code {
      font-size: $h3-font-size;
      line-height: 22px;
    }
  }

  &_actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 170px;
    margin: 0 auto;
    padding: 34px 0;
    

    &_button {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 44px;
      height: 44px;
      background: #ffffff;
      border: 0;
      cursor: pointer;
      border-radius: 50%;

      &_icon {
        width: 16px;
        height: 16px;
      }

      &_swap {
        height: 30px;
      }
    }
  }

  &_title {
    text-align: center;
    font-size: $h5-font-size;
    padding-bottom: 18px;
  }

  &_transactions {
    flex: 1;
    flex-basis: 0;
    overflow-y: scroll;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
