<template>
  <div class="transaction">
    <div class="transaction_icon"></div>
    <div class="transaction_action">{{title}}</div>
    <div class="transaction_time">{{time}}</div>
    <div class="transaction_amount">{{amount}} {{code}}</div>
    <div class="transaction_status">
      <ConfirmedIcon v-if="confirmed" />
      <div class="transaction_status_confirming" v-if="!confirmed">
        <ConfirmingIcon />
        <span class="transaction_status_steps" v-if="step">{{step}} / {{numSteps}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import cryptoassets from '@liquality/cryptoassets'
import BN from 'bignumber.js'
import ConfirmedIcon from '@/assets/icons/confirmed.svg'
import ConfirmingIcon from '@/assets/icons/confirming.svg'

export default {
  components: {
    ConfirmedIcon,
    ConfirmingIcon
  },
  props: {
    asset: String,
    amount: Number,
    type: {
      type: String,
      validator: (val) => ['send', 'receive', 'swap']
    },
    title: String,
    timestamp: Number,
    confirmed: Boolean,
    step: Number,
    numSteps: Number
  },
  computed: {
    code: function () {
      return cryptoassets[this.asset.toLowerCase()].code
    },
    time: function () {
      return moment.unix(this.timestamp).format('L, LT')
    }
  }
}
</script>

<style lang="scss">
.transaction {
  height: 60px;
  border-top: 1px solid $hr-border-color;
  display: grid;
  grid-template-columns: 44px 1fr 1fr 44px;
  grid-template-rows: 1fr 1fr;
  grid-template-areas: 
  "icon action amount status"
  "icon time detail status";

  &_icon {
    grid-area: icon;
  }

  &_action {
    grid-area: action;
  }

  &_time {
    grid-area: time;
  }

  &_amount {
    grid-area: amount;
    text-align: right;
  }

  &_status {
    grid-area: status;
    &_confirming {
      position: relative;

      svg {
        stroke: red;
        width: 30px;
        height: 30px;
      }
    }
    &_steps {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 30px;
      height: 30px;
      top: 0;
      font-size: 10px;
    }
  }
}
</style>