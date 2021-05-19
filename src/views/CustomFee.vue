<template>
  <div class="view-container">
    <div class="swap">
      <NavBar :showBackButton="false" :showBack="false" :showMenuList="false">
        Network Speed/Fee
      </NavBar>
      <div class="wrapper form">
        <div class="wrapper_top">
        </div>
        <div class="wrapper_bottom">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAssetColorStyle, getAssetIcon } from '@/utils/asset'

export default {
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
