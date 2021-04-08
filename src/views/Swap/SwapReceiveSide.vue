<template>
  <div class="swap-receive-container">
    <div class="swap-receive-top">
      <div class="swap-receive-top-label">
        Receive
      </div>
      <div class="swap-receive-top-amount">
        <div class="btn btn-option label-append" @click="toogleShowAmountsFiat">
           <span v-if="showAmountsInFiat" :style="getAssetColorStyle(toAsset)">
                {{ `${toAsset} ${receiveAmount}` }}
              </span>
              <span v-else>
                {{ receiveAmountFiat }}
              </span>
        </div>
      </div>
    </div>
    <div class="swap-receive-main">
      <div class="swap-receive-main-input-container">
        <input
                v-if="showAmountsInFiat"
                type="text"
                class="form-control swap-receive-main-input"
                :value="receiveAmountFiat"
                @input="$emit('update:receiveAmountFiat', $event.target.value)"
                placeholder="0.00"
                autocomplete="off"
                :disabled="!hasMarket"
              />
              <input
                v-else
                type="text"
                class="form-control input-amount"
                :value="receiveAmount"
                @input="$emit('update:receiveAmount', $event.target.value)"
                placeholder="0.00"
                :style="getAssetColorStyle(toAsset)"
                autocomplete="off"
                :disabled="!hasMarket"
              />
      </div>
      <div class="swap-receive-main-sub">
                   <small
              class="form-text d-flex justify-content-between"
              v-if="!enterSendToAddress"
            >
              <div class="swap_limits">
                <a @click="enterSendToAddress = true">
                  + Receive at external address
                </a>
              </div>
            </small>
      </div>
      <div class="swap-receive-main-asset"></div>
    </div>
    <div class="swap-receive-bottom" v-if="enterSendToAddress">
            <label class="w-100 d-flex align-items-center justify-content-between" for="sendTo">
              <div>Receive at</div>
              <div>
                <CloseIcon
                class="float-right icon-sm icon-btn"
                @click="closeReceiveAt"
              />
              </div>
            </label>
            <div class="input-group">
              <input
                type="text"
                :value="sendTo"
                @input="$emit('update:sendTo', $event.target.value)"
                class="form-control form-control-sm"
                id="to"
                placeholder="External Receiving Address"
                autocomplete="off"
              />
            </div>
    </div>
  </div>
</template>

<script>
import { getAssetColorStyle, getAssetIcon } from '@/utils/asset'
import CloseIcon from '@/assets/icons/close.svg'

export default {
  components: {
    CloseIcon
  },
  data () {
    return {
      enterSendToAddress: false,
      showAmountsInFiat: false
    }
  },
  props: [
    'toAsset',
    'sendTo',
    'receiveAmount',
    'receiveAmountFiat',
    'hasMarket'
  ],
  created () {},
  methods: {
    getAssetColorStyle,
    getAssetIcon,
    toogleShowAmountsFiat () {
      this.showAmountsInFiat = !this.showAmountsInFiat
    },
    closeReceiveAt () {
      this.enterSendToAddress = false
      this.$emit('update:sendTo', null)
    },
    assetIconClick () {
      this.$emit('to-asset-icon-click')
    }
  }
}
</script>

<style lang="scss">
.swap-receive-container {
  display: flex;
  flex-direction: column;
  width: 100%;

  .swap-receive-top {
    display: flex;
    justify-content: space-between;

    .swap-receive-top-label {
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
    }
  }

  .swap-receive-main {
    display: flex;
    flex-direction: column;
    .swap-receive-main-input {
      display: flex;
    }

    .swap-receive-main-errors {
      display: flex;
      width: 100%;
    }

  }

  .swap-receive-bottom {
    display: flex;
    align-items: center;
    flex-direction: column;

    .swap-receive-bottom-available {
      line-height: 15px;
      text-transform: none;
      font-weight: normal;
      font-size: $font-size-tiny;
    }

  }
}
</style>
