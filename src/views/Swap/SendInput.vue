<template>
  <div class="swap-send-container">
    <div class="swap-send-main">
      <div class="swap-send-main-input-container">
        <div class="swap-send-main-input">
          <div class="swap-send-top">
            <div class="swap-send-top-label">Send</div>
            <div class="swap-send-top-amount">
              <div
                class="btn btn-option label-append"
                @click="toggleShowAmountsFiat"
              >
                <span
                  v-if="showAmountsInFiat"
                  :style="getAssetColorStyle(asset)"
                >
                  {{ `${asset} ${sendAmount}` }}
                </span>
                <span v-else> ${{ sendAmountFiat }} </span>
              </div>
            </div>
          </div>
          <div class="input-group mb-3" v-if="showAmountsInFiat">
            <span class="input-group-text">$</span>
            <input
              type="number"
              class="form-control"
              :class="{ 'is-invalid': showErrors && amountError }"
              :value="sendAmountFiat"
              @input="$emit('update:sendAmountFiat', $event.target.value)"
              placeholder="0.00"
              autocomplete="off"
              :disabled="disabled"
            />
          </div>
          <input
            v-else
            type="number"
            class="form-control"
            id="swap_send_amount_input_field"
            :class="{ 'is-invalid': showErrors && amountError }"
            :value="sendAmount"
            @input="$emit('update:sendAmount', $event.target.value)"
            placeholder="0.00"
            :style="getAssetColorStyle(asset)"
            autocomplete="off"
            :disabled="disabled"
          />
        </div>
        <AccountTooltip :account="account" :asset="asset">
          <div class="swap-send-main-icon" @click="assetIconClick">
            <img :src="getAssetIcon(asset)" class="asset-icon" />
            <span class="asset-name">
              {{ asset }}
            </span>
            <div>
              <ChevronRightIcon />
            </div>
          </div>
        </AccountTooltip>
      </div>
      <div class="swap-send-main-errors" v-if="showErrors && amountError">
        <small class="text-danger form-text text-right">
          {{ amountError }}
        </small>
      </div>
    </div>
    <div class="swap-send-bottom">
      <div class="swap-send-bottom-options">
        <div class="btn-group">
          <v-popover offset="1" trigger="hover focus" class="mr-2">
            <button
              :class="{
                active: amountOption === 'min' && !disabled,
              }"
              :disabled="disabled"
              class="btn btn-option"
              id="min_amount_send_button"
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
                active: amountOption === 'max' && !disabled,
              }"
              :disabled="disabled"
              class="btn btn-option tooltip-target"
              id="max_amount_send_button"
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
        {{ isNaN(available) ? '0' : dpUI(available) || '0' }} {{ asset }}
      </div>
    </div>
  </div>
</template>

<script>
import { getAssetColorStyle, getAssetIcon } from '@/utils/asset'
import { dpUI } from '@/utils/coinFormatter'
import ChevronRightIcon from '@/assets/icons/chevron_right_gray.svg'
import AccountTooltip from '@/components/AccountTooltip'

export default {
  components: {
    ChevronRightIcon,
    AccountTooltip
  },
  data () {
    return {
      showAmountsInFiat: false
    }
  },
  props: [
    'account',
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
    'disabled',
    'amountOption'
  ],
  created () {},
  methods: {
    dpUI,
    getAssetColorStyle,
    getAssetIcon,
    toggleShowAmountsFiat () {
      this.showAmountsInFiat = !this.showAmountsInFiat
    },
    setSendAmount (amount) {
      this.$emit('send-amount-change', amount)
    },
    assetIconClick () {
      this.$emit('from-asset-click')
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
    .swap-send-main-input-container {
      display: flex;
      justify-content: space-between;

      .swap-send-main-input {
        display: flex;
        flex-direction: column;
        max-width: 190px;
      }
    }

    .swap-send-main-icon {
      cursor: pointer;
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

    .swap-send-main-errors {
      display: flex;
      width: 100%;
    }
  }

  .swap-send-bottom {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;

    .swap-send-bottom-available {
      line-height: 15px;
      text-transform: none;
      font-weight: normal;
      font-size: $font-size-tiny;
    }
  }
}
</style>
