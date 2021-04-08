<template>
  <div class="swap-send-container">
    <div class="swap-send-top">
      <div class="swap-send-top-label">
        Send
      </div>
      <div class="swap-send-top-amount">
        <div class="btn btn-option label-append" @click="toogleShowAmountsFiat">
          <span v-if="showAmountsInFiat" :style="getAssetColorStyle(asset)">
            {{ `${asset} ${sendAmount}` }}
          </span>
          <span v-else>
            {{ sendAmountFiat }}
          </span>
        </div>
      </div>
    </div>
    <div class="swap-send-main">
      <div class="swap-send-main-input">
        <input
          v-if="showAmountsInFiat"
          type="text"
          class="form-control input-amount"
          :class="{ 'is-invalid': showErrors && amountError }"
          :value="sendAmountFiat"
          @input="$emit('update:sendAmountFiat', $event.target.value)"
          placeholder="0.00"
          autocomplete="off"
          :disabled="!hasMarket"
        />
        <input
          v-else
          type="text"
          class="form-control input-amount"
          :class="{ 'is-invalid': showErrors && amountError }"
          :value="sendAmount"
          @input="$emit('update:sendAmount', $event.target.value)"
          placeholder="0.00"
          :style="getAssetColorStyle(asset)"
          autocomplete="off"
          :disabled="!hasMarket"
        />
      </div>
      <div class="swap-send-main-errors" v-if="showErrors && amountError">
        <small class="text-danger form-text text-right">
          {{ amountError }}
        </small>
      </div>
      <div class="swap-send-main-asset"></div>
    </div>
    <div class="swap-send-bottom">
      <div class="swap-send-bottom-options">
        <div class="btn-group">
          <v-popover offset="1" trigger="hover focus" class="mr-2">
            <button
              :class="{
                active: amountOption === 'min' && hasMarket,
              }"
              :disabled="!hasMarket"
              class="btn btn-option"
              @click="setSendAmount(min)"
            >
              Min
            </button>
            <template slot="popover">
              <p class="my-0 text-right">{{ min }} {{ asset }}</p>
              <p class="text-muted my-0 text-right">{{ minFiat }} USD</p>
            </template>
          </v-popover>
          <v-popover offset="1" trigger="hover focus">
            <button
              :class="{
                active: amountOption === 'max' && hasMarket,
              }"
              :disabled="!hasMarket"
              class="btn btn-option tooltip-target"
              @click="setSendAmount(max)"
            >
              Max
            </button>
            <template slot="popover">
              <p class="my-0 text-right">{{ max }} {{ asset }}</p>
              <p class="text-muted my-0 text-right">{{ maxFiat }} USD</p>
            </template>
          </v-popover>
        </div>
      </div>
      <div class="swap-send-bottom-available">
        <span class="text-muted">Available</span>
        {{ available }} {{ asset }}
      </div>
    </div>
  </div>
</template>

<script>
import { getAssetColorStyle, getAssetIcon } from '@/utils/asset'

export default {
  components: {},
  data () {
    return {
      showAmountsInFiat: false
    }
  },
  props: [
    'asset',
    'available',
    'sendAmount',
    'sendAmountFiat',
    'min',
    'max',
    'minFiat',
    'maxFiat',
    'showErrors',
    'amountError',
    'hasMarket',
    'amountOption'
  ],
  created () {},
  methods: {
    getAssetColorStyle,
    getAssetIcon,
    toogleShowAmountsFiat () {
      this.showAmountsInFiat = !this.showAmountsInFiat
    },
    setSendAmount (amount) {
      this.$emit('send-amount-change', amount)
    }
  }
}
</script>

<style lang="scss">
.swap-send-container {
  display: flex;
  flex-direction: column;
  width: 100%;

  .swap-send-top {
    display: flex;
    justify-content: space-between;

    .swap-send-top-label {
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
    }
  }

  .swap-send-main {
    display: flex;
    flex-direction: column;
    .swap-send-main-input {
      display: flex;
    }

    .swap-send-main-errors {
      display: flex;
      width: 100%;
    }

  }

  .swap-send-bottom {
    display: flex;
    justify-content: space-between;

    .swap-send-bottom-available {
      line-height: 15px;
      text-transform: none;
      font-weight: normal;
      font-size: $font-size-tiny;
    }

  }
}
</style>
