<template>
  <div class="account">
    <div class="account_header">
      <img :src="'./img/btc.png'" />BTC
    </div>
    <div class="account_main">
      <div class="account_balance">
        <span class="account_balance_value">6.156523</span>
        <span class="account_balance_code">BTC</span>
      </div>
      <div class="account_actions">
        <button class="account_action_button"><SendIcon /></button>
        <button class="account_action_button"><ReceiveIcon /></button>
        <button class="account_action_button"><SwapIcon /></button>
      </div>
      <div class="account_transactions">
        <h3 class="account_transactions_title">Transactions</h3>
        <div class="account_transactions_list">
          <Transaction asset="BTC" v-bind:amount="0.252932" type="send" title="Send BTC" v-bind:timestamp="1589147122" v-bind:confirmed="true" />
          <Transaction asset="BTC" v-bind:amount="0.04522" type="receive" title="Receive BTC" v-bind:timestamp="1589147004" v-bind:confirmed="false" />
          <Transaction asset="BTC" v-bind:amount="0.01092" type="swap" title="Swap BTC to ETH" v-bind:timestamp="1589123946" v-bind:confirmed="false" v-bind:step="1" v-bind:numSteps="3" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SendIcon from '@/assets/icons/arrow_send.svg'
import ReceiveIcon from '@/assets/icons/arrow_receive.svg'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import Transaction from '@/components/v2/Transaction'

export default {
  components: {
    SendIcon,
    ReceiveIcon,
    SwapIcon,
    Transaction
  }
}
</script>

<style lang="scss">
.account {

  &_main {
    background: $brand-gradient;
    color: $color-text-secondary;
  }

}
</style>
