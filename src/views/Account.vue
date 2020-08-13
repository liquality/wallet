<template>
  <div class="account">
    <NavBar showMenu="true" showBack="true" backPath="/wallet" backLabel="Assets">
      <span class="account_header"><img :src="'./img/' + asset.toLowerCase() +'.png'" /> {{asset}}</span>
    </NavBar>
    <div class="account_main">
      <div class="account_top">
        <RefreshIcon @click="refresh" class="account_refresh-icon" />
        <div class="account_balance">
          <span class="account_balance_value">{{balance}}</span>
          <span class="account_balance_code">{{asset}}</span>
        </div>
        <div class="account_actions">
          <router-link v-bind:to="'/account/' + asset + '/send'"><button class="account_actions_button">
            <div class="account_actions_button_wrapper"><SendIcon class="account_actions_button_icon" /></div>Send
          </button></router-link>
          <router-link v-bind:to="'/account/' + asset + '/receive'"><button class="account_actions_button">
            <div class="account_actions_button_wrapper"><ReceiveIcon class="account_actions_button_icon" /></div>Receive
          </button></router-link>
          <router-link v-bind:to="'/account/' + asset + '/swap'"><button class="account_actions_button">
            <div class="account_actions_button_wrapper"><SwapIcon class="account_actions_button_icon account_actions_button_swap" /></div>Swap
          </button></router-link>
        </div>
        <div class="account_title">Transactions</div>
      </div>
      <div class="account_transactions">
        <router-link :to="item.type === 'SWAP' ? `/tx/${item.id}` : ''" v-for="(item) in assetHistory" :key="item.id">
          <Transaction
            v-bind:asset="item.from"
            v-bind:amount="getTransactionAmount(item)"
            v-bind:type="item.type"
            v-bind:title="getTransactionTitle(item)"
            v-bind:timestamp="item.startTime"
            v-bind:detail="getTransactionStatus(item)"
            v-bind:confirmed="['SUCCESS', 'REFUNDED'].includes(item.status)"
            v-bind:step="getTransactionStep(item)"
            v-bind:numSteps="getTransactionNumSteps(item)"
            v-bind:error="item.error" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import NavBar from '@/components/NavBar.vue'
import RefreshIcon from '@/assets/icons/refresh.svg'
import SendIcon from '@/assets/icons/arrow_send.svg'
import ReceiveIcon from '@/assets/icons/arrow_receive.svg'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import Transaction from '@/components/Transaction'
import { prettyBalance } from '@/utils/coinFormatter'
import { ORDER_STATUS_STEP_MAP, ORDER_STATUS_LABEL_MAP } from '@/utils/order'

export default {
  components: {
    NavBar,
    RefreshIcon,
    SendIcon,
    ReceiveIcon,
    SwapIcon,
    Transaction
  },
  props: ['asset'],
  computed: {
    ...mapState(['activeWalletId', 'activeNetwork', 'balances', 'history']),
    balance () {
      return prettyBalance(this.balances[this.activeNetwork][this.activeWalletId][this.asset], this.asset)
    },
    assetHistory () {
      if (!this.history[this.activeNetwork]) return []
      if (!this.history[this.activeNetwork][this.activeWalletId]) return []
      return this.history[this.activeNetwork][this.activeWalletId]
        .slice()
        .filter((item) => item.from === this.asset)
        .reverse()
    }
  },
  methods: {
    ...mapActions(['updateBalances']),
    refresh () {
      this.updateBalances({ network: this.activeNetwork, walletId: this.activeWalletId })
    },
    getTransactionStatus (item) {
      return item.type === 'SWAP' ? ORDER_STATUS_LABEL_MAP[item.status] : undefined
    },
    getTransactionStep (item) {
      return item.type === 'SWAP' ? ORDER_STATUS_STEP_MAP[item.status] : undefined
    },
    getTransactionNumSteps (item) {
      if (item.type !== 'SWAP') {
        return undefined
      }

      return item.sendTo ? 5 : 4
    },
    getTransactionTitle (item) {
      if (item.type === 'SWAP') {
        return `${item.from} to ${item.to}`
      }
      if (item.type === 'SEND') {
        return `Send ${item.from}`
      }
      if (item.type === 'RECEIVE') {
        return `Receive ${item.from}`
      }
    },
    getTransactionAmount (item) {
      return item.type === 'SWAP' ? item.fromAmount : item.amount
    }
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
    align-items: center;
    justify-content: center;
    font-size: $h3-font-size;

    img {
      width: 28px;
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
    position: relative;
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

  &_refresh-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    path {
      fill: $color-text-secondary;
    }
  }

  &_actions {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    padding: 24px 0;

    &_button {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      width: 70px;
      border: 0;
      cursor: pointer;
      color: $color-text-secondary;
      background: none;

      &_wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 44px;
        height: 44px;
        background: #ffffff;
        border-radius: 50%;
        margin-bottom: 4px;
      }

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
