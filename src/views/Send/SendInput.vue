<template>
  <div class="send-container">
    <div class="send-main">
      <div class="send-main-input-container">
        <div class="send-main-input">
          <div class="send-top">
            <div class="send-top-label">Send</div>
            <div class="send-top-amount">
              <button
                class="btn btn-option label-append"
                @click="toggleShowAmountsFiat"
                :disabled="!fiatRates[asset]"
              >
                <span v-if="showAmountsInFiat" :style="getAssetColorStyle(asset)">
                  {{ `${asset} ${dpUI(amount)}` }}
                </span>
                <span v-else> {{ formatFiatUI(amountFiat) }} </span>
              </button>
            </div>
          </div>
          <div class="input-group">
            <span v-if="showAmountsInFiat" class="input-group-text">{{
              isNaN(amountFiat) ? '' : '$'
            }}</span>
            <input
              v-if="showAmountsInFiat"
              type="number"
              class="form-control"
              :class="{ 'is-invalid': amountError }"
              :value="amountFiatInputFormat()"
              @input="$emit('update:amountFiat', $event.target.value)"
              placeholder="0.00"
              autocomplete="off"
              aria-label="Amount (to the nearest dollar)"
            />
            <input
              v-else
              type="number"
              class="form-control"
              id="send_amount_input_field"
              :class="{ 'is-invalid': amountError }"
              :value="amount"
              @input="$emit('update:amount', $event.target.value)"
              placeholder="0.00"
              :style="getAssetColorStyle(asset)"
              autocomplete="off"
            />
          </div>
        </div>

        <AccountTooltip :account="account" :asset="asset">
          <div class="send-main-icon">
            <img :src="getAssetIcon(asset)" class="asset-icon" />
            <span class="asset-name">
              {{ asset }}
            </span>
          </div>
        </AccountTooltip>
      </div>
      <div class="send-main-errors" v-if="amountError">
        <small class="text-danger form-text text-right">
          {{ amountError }}
        </small>
      </div>
    </div>
    <div class="send-bottom">
      <div class="send-bottom-available" id="send_available_balance">
        <span class="text-muted">Available</span>
        {{ isNaN(available) ? '0' : dpUI(available) || '0' }} {{ asset }}
      </div>
      <div class="send-bottom-options">
        <div class="btn-group">
          <v-popover offset="1" trigger="hover focus">
            <button
              :class="{
                active: maxActive
              }"
              class="btn btn-option tooltip-target"
              id="max_send_amount_button"
              @click="$emit('toggle-max')"
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
    </div>
  </div>
</template>

<script>
import { getAssetColorStyle, getAssetIcon } from '@/utils/asset'
import { dpUI, formatFiatUI } from '@/utils/coinFormatter'
import AccountTooltip from '@/components/AccountTooltip'
import { mapState } from 'vuex'

export default {
  components: {
    AccountTooltip
  },
  data() {
    return {
      showAmountsInFiat: false
    }
  },
  props: [
    'asset',
    'amount',
    'account',
    'amountFiat',
    'max',
    'available',
    'maxFiat',
    'amountError',
    'maxActive'
  ],
  computed: {
    ...mapState(['fiatRates'])
  },
  methods: {
    dpUI,
    formatFiatUI,
    getAssetColorStyle,
    getAssetIcon,
    toggleShowAmountsFiat() {
      this.showAmountsInFiat = !this.showAmountsInFiat
    },
    amountFiatInputFormat() {
      // in case of undefined/NaN value for amount in fiat, present the placeholder value
      return !this.amountFiat ? '' : this.amountFiat.replaceAll(',', '')
    }
  }
}
</script>

<style lang="scss">
.send-container {
  display: flex;
  flex-direction: column;
  width: 100%;

  .send-top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .send-top-label {
      font-size: $font-size-tiny;
      font-weight: $headings-font-weight;
      text-transform: uppercase;
    }
  }

  .send-main {
    display: flex;
    flex-direction: column;
    .send-main-input-container {
      display: flex;
      align-items: flex-end;
      justify-content: flex-start;

      .send-main-input {
        display: flex;
        flex-direction: column;
        max-width: 190px;

        .input-group {
          align-items: flex-end;
        }

        .form-control {
          margin-top: 5px;
          text-align: right;
        }
      }
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

    .send-main-errors {
      display: flex;
      width: 100%;
    }
  }

  .send-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    max-width: 190px;

    .send-bottom-available {
      line-height: 15px;
      text-transform: none;
      font-weight: $font-weight-light;
      font-size: $font-size-tiny;
    }
  }
}
</style>
