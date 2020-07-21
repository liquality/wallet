<template>
  <div :class="{
    transaction: true,
    'text-danger': !!error
  }" @click="$emit('click')">
    <div class="transaction_icon">
      <SendIcon v-if="type ==='SEND'" class="transaction_icon_send" />
      <ReceiveIcon v-if="type ==='RECEIVE'" class="transaction_icon_receive" />
      <SwapIcon v-if="type ==='SWAP'" class="transaction_icon_swap"/>
    </div>
    <div class="transaction_action">{{title}}</div>
    <div class="transaction_time">{{time}}</div>
    <div class="transaction_amount">{{amount}} {{code}}</div>
    <div class="transaction_detail"></div>
    <div class="transaction_status" v-if="!error">
      <CompletedIcon v-if="confirmed" />
      <div class="transaction_status_confirming" v-if="!confirmed">
        <SpinnerIcon />
        <span class="transaction_status_steps" v-if="step">{{step}} / {{numSteps}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment/min/moment-with-locales'
import cryptoassets from '@liquality/cryptoassets'
import SendIcon from '@/assets/icons/arrow_send.svg'
import ReceiveIcon from '@/assets/icons/arrow_receive.svg'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import CompletedIcon from '@/assets/icons/completed.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'

const locale = window.navigator.userLanguage || window.navigator.language
moment.locale(locale)

export default {
  components: {
    SendIcon,
    ReceiveIcon,
    SwapIcon,
    CompletedIcon,
    SpinnerIcon
  },
  props: {
    asset: String,
    amount: Number,
    type: {
      type: String,
      validator: (val) => ['SEND', 'RECEIVE', 'SWAP']
    },
    title: String,
    timestamp: Number,
    confirmed: Boolean,
    step: Number,
    numSteps: Number,
    error: String
  },
  computed: {
    code: function () {
      return cryptoassets[this.asset.toLowerCase()].code
    },
    time: function () {
      return moment(this.timestamp).format('L, LT')
    }
  }
}
</script>

<style lang="scss">
.transaction {
  height: 60px;
  padding: 12px 0;
  border-bottom: 1px solid $hr-border-color;
  display: grid;
  grid-template-columns: 44px 1fr 1fr 60px;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
  "icon action amount status"
  "icon time detail status";
  align-items: center;
  font-size: $font-size-sm;

  &_icon {
    grid-area: icon;
    justify-self: center;

    &_send, &_receive {
      width: 18px;
      height: 18px;
    }

    &_send {
      path {
        stroke: #FF287D;
      }
    }
    &_receive {
      path {
        stroke: #2CD2CF;
      }
    }

    &_swap {
      width: 20px;
      height: 24px;
      path {
        stroke: #A8AEB7;
      }
    }
  }

  &_action {
    grid-area: action;
  }

  &_time {
    grid-area: time;
    font-size: $font-size-tiny;
    color: #646F85;;
  }

  &_amount {
    grid-area: amount;
    text-align: right;
  }

  &_detail {
    grid-area: detail;
    color: #646F85;;
    text-align: right;
  }

  &_status {
    grid-area: status;
    justify-self: center;

    svg {
      width: 30px;
      height: 30px;
    }

    &_confirming {
      position: relative;
    }
    &_steps {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 30px;
      height: 30px;
      top: 0;
      font-size: $font-size-tiny;
      letter-spacing: -1px;
    }
  }
}
</style>
