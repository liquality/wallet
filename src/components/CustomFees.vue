<template>
  <div class="swap">
    <NavBar :showBackButton="false" :showBack="false" :showMenuList="false">
      Network Speed/Fee
    </NavBar>
    <div class="wrapper form">
      <div class="wrapper_top">
        <div class="selected-asset">
          <img :src="getAssetIcon(asset)" class="asset-icon" />
          <span class="asset-name">
            {{ asset }}
          </span>
        </div>
        <!-- Presets -->
        <div class="custom-fee-title">Presets</div>
        <div class="custom-fee-presets">
          <div
            class="custom-fee-presets-option"
            v-for="name in ['slow', 'average', 'fast']"
            :key="name"
            :class="{ active: name === preset }"
            @click="setPreset(name)"
          >
            <div class="custom-fee-name">{{ getFeeLabel(name) }}</div>
            <div class="custom-fee-time">
              <span v-if="fees[name] && fees[name].wait">
                ~ {{ fees[name].wait }} sec
              </span>
            </div>
            <div class="custom-fee-amount">
              {{  getCustomFeeAmount(name) }}
            </div>
            <div class="custom-fee-fiat">
              {{ getCustomFiatAmount(name) }}
            </div>
          </div>
        </div>
        <!-- Customized -->

        <!-- Presets -->
      </div>
      <div class="wrapper_bottom">
        <div class="button-group">
          <button
            class="btn btn-light btn-outline-primary btn-lg"
            @click="cancel"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary btn-lg btn-block"
            @click="apply"
            :disabled="!fee"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAssetIcon, getNativeAsset } from '@/utils/asset'
import NavBar from '@/components/NavBar'
import { getTxFee, getFeeLabel } from '@/utils/fees'
import BN from 'bignumber.js'
import { prettyFiatBalance } from '@/utils/coinFormatter'
import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'

export default {
  components: {
    NavBar
  },
  data () {
    return {
      fee: null,
      preset: 'average'
    }
  },
  props: ['asset', 'selectedFee', 'fees', 'txTypes', 'fiatRates'],
  created () {
    this.preset = this.selectedFee?.[this.asset] || 'average'
  },
  computed: {
    nativeAsset () {
      return getNativeAsset(this.asset)
    }
  },
  methods: {
    getFeeLabel,
    getAssetIcon,
    cancel () {
      this.$emit('cancel')
    },
    apply () {
      this.$emit('apply', this.fee)
    },
    setPreset (name) {
      this.preset = name
    },
    getTotalAmount (name) {
      return this.txTypes.reduce((accum, tx) => {
        return accum.plus(getTxFee(this.asset, tx, this.fees[name].fee))
      }, BN(0))
    },
    getCustomFiatAmount (name) {
      if (this.txTypes) {
        const total = this.getTotalAmount(name)
        const totalFiat = prettyFiatBalance(total, this.fiatRates[this.nativeAsset])
        return `${totalFiat} USD`
      }
      return ''
    },
    getCustomFeeAmount (name) {
      if (this.txTypes) {
        const total = this.getTotalAmount(name)
        return `${BN(total).dp(6)} ${this.nativeAsset}`
      } else {
        const chainId = cryptoassets[this.asset].chain
        const { unit } = chains[chainId].fees
        return `${this.fees[name].fee} ${unit}`
      }
    }
  }
}
</script>

<style lang="scss">
.selected-asset {
  display: flex;
  align-items: flex-end;
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

.custom-fee-title {
  display: flex;
  align-items: center;
  letter-spacing: -0.08px;
  text-transform: uppercase;
  font-style: normal;
  font-weight: bold;
  font-size: 12px;
  line-height: 18px;
  color: #3d4767;
  margin-top: 10px;
  margin-bottom: 10px;
}

.custom-fee-presets {
  height: 81px;
  width: 100%;
  display: flex;
  border: 1px solid $hr-border-color;
  margin-bottom: 30px;

  .custom-fee-presets-option {
    flex: 1;
    padding: 4px;
    cursor: pointer;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;

    &:not(:last-child) {
      border-right: 1px solid $hr-border-color;
    }
    &.active, &:hover {
      background-color: #F0F7F9;
    }
    .custom-fee-name {
      font-style: normal;
      font-weight: 300;
      font-size: 14px;
      line-height: 26px;
    }

    .custom-fee-time,
    .custom-fee-amount {
      font-style: normal;
      font-weight: 300;
      font-size: 12px;
      line-height: 16px;
    }

    .custom-fee-fiat {
      font-weight: 300;
      font-size: 10px;
      line-height: 16px;
      color: #646f85;
    }
  }
}
</style>
