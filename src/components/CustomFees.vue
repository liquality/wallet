<template>
  <div class="swap">
    <NavBar :showBackButton="false" :showBack="false" :showMenuList="false">
      Network Speed/Fee
    </NavBar>
    <div class="wrapper form">
      <div class="wrapper_top">
        <div class="selected-asset" id="custom_fee_selected_asset">
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
            :id=name
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
              {{ getFeeAmount(name) }}
            </div>
            <div class="custom-fee-fiat">
              {{ getFiatAmount(name) }}
            </div>
          </div>
        </div>
        <!-- Customized -->
        <div class="custom-fee-title">Customized Setting</div>
        <div class="custom-fee-customized">
          <div class="custom-fee-details">
            <div class="custom-fee-details-item">
              <div class="gas-price-label">Gas Price</div>
              <div class="gas-price-amount" v-if="customFiatAmount">
                $ {{ customFiatAmount }}
              </div>
            </div>
            <div class="custom-fee-details-item">
              <div class="gas-unit-label">{{ gasUnit }}</div>
              <div class="input-group">
                <input type="number"
                     class="form-control"
                       id="custom_fee_input_field"
                     :step="stepSize"
                     :value="fee"
                     @input="setCustomFee(parseFloat($event.target.value))" />
                <div class="input-group-text fee-input-controls">
                  <ChevronUpIcon @click="incrementFee"/>
                  <ChevronDownIcon  @click="decrementFee"/>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Result -->
        <div class="custom-fee-result" id="custom_speed_fee_results">
          <div class="custom-fee-result-title">
            New Speed/Fee
          </div>
          <div class="custom-fee-result-amount">{{ customFeeAmount }}</div>
          <div class="custom-fee-result-fiat" v-if="customFiatAmount">
            {{ customFiatAmount }}
          </div>
        </div>
      </div>
      <div class="wrapper_bottom">
        <div class="button-group">
          <button
            class="btn btn-light btn-outline-primary btn-lg"
            id="custom_fee_cancel_button"
            @click="cancel"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary btn-lg btn-block"
            id="custom_fee_apply_button"
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
import { getAssetIcon, getNativeAsset, getFeeAsset } from '@/utils/asset'
import NavBar from '@/components/NavBar'
import { getFeeLabel } from '@/utils/fees'
import BN from 'bignumber.js'
import { prettyFiatBalance } from '@/utils/coinFormatter'
import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'
import ChevronUpIcon from '@/assets/icons/chevron_up.svg'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'

export default {
  components: {
    NavBar,
    ChevronUpIcon,
    ChevronDownIcon
  },
  data () {
    return {
      fee: null,
      preset: null
    }
  },
  props: ['asset', 'selectedFee', 'fees', 'totalFees', 'fiatRates'],
  created () {
    this.preset = this.selectedFee || 'average'
    this.fee = this.fees[this.preset]?.fee
  },
  computed: {
    nativeAsset () {
      return getFeeAsset(this.asset) || getNativeAsset(this.asset)
    },
    gasUnit () {
      const chainId = cryptoassets[this.asset]?.chain
      if (chainId) {
        const { unit } = chains[chainId]?.fees || ''
        return getFeeAsset(this.asset) || unit
      }
      return ''
    },
    customFiatAmount () {
      return this.getFiatAmount()
    },
    customFeeAmount () {
      return this.getFeeAmount()
    },
    stepSize () {
      const chainId = cryptoassets[this.asset].chain
      return ({
        bitcoin: 1,
        ethereum: 1,
        rsk: 1,
        bsc: 1,
        polygon: 1,
        near: 0.00001,
        solana: 0.00001,
        terra: 1
      })[chainId] || 1
    }
  },
  methods: {
    getFeeLabel,
    getAssetIcon,
    cancel () {
      this.$emit('cancel')
    },
    apply () {
      this.$emit('apply', {
        asset: this.asset,
        fee: this.fee
      })
    },
    setCustomFee (fee) {
      this.fee = fee
      this.$emit('update', {
        asset: this.asset,
        fee: this.fee
      })
    },
    setPreset (name) {
      this.preset = name
      this.fee = this.fees[name]?.fee
    },
    incrementFee () {
      this.setCustomFee(this.fee + this.stepSize)
    },
    decrementFee () {
      if (this.fee && this.fee > 0) {
        this.setCustomFee(this.fee - this.stepSize)
      }
    },
    getFeeAmount (name) {
      if (!name) name = this.preset || 'custom'
      if (this.totalFees && this.totalFees[name]) {
        const totalFee = this.totalFees[name]
        return `${BN(totalFee).dp(6)} ${this.nativeAsset}`
      } else {
        const chainId = cryptoassets[this.asset].chain
        const { unit } = chains[chainId].fees
        return `${this.fee || 0} ${unit}`
      }
    },
    getFiatAmount (name) {
      if (!name) name = this.preset || 'custom'
      if (this.totalFees && this.totalFees[name]) {
        const totalFiat = prettyFiatBalance(
          this.totalFees[name],
          this.fiatRates[this.nativeAsset]
        )
        return `${totalFiat} USD`
      }
      return ''
    }
  },
  watch: {
    fee: function (val) {
      if (this.fees) {
        this.preset = ({
          [this.fees?.slow?.fee]: 'slow',
          [this.fees?.average?.fee]: 'average',
          [this.fees?.fast?.fee]: 'fast'
        })[val || 0]
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
    &.active,
    &:hover {
      background-color: #f0f7f9;
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

.custom-fee-customized {
  display: flex;
}

.custom-fee-details {
  flex: 1;
  display: flex;
  flex-direction: column;

  .custom-fee-details-item {
    flex: 1;
    display: flex;

    .gas-unit-label {
      text-transform: uppercase;
      font-style: normal;
      font-weight: 300;
      font-size: 14px;
      line-height: 150%;
    }

    .gas-price-label {
      font-style: normal;
      font-weight: bold;
      font-size: 12px;
      line-height: 18px;
      display: flex;
      align-items: center;
      letter-spacing: -0.08px;
    }

    .gas-price-amount {
      font-style: normal;
      font-weight: 300;
      font-size: 12px;
      line-height: 18px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      text-align: right;
    }

    & input {
      height: 25px !important;
      align-items: flex-end;
      font-style: normal;
      font-weight: 300;
      font-size: 14px;
      line-height: 18px;
      text-align: right;
      margin-left: 4px;
    }

    & input[type=number]::-webkit-inner-spin-button,
    & input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    & div {
      display: flex;
      align-items: flex-end;
    }

    .fee-input-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      width: 20px;
      height: 25px;

      & svg {
        cursor: pointer;
        width: 12px;
        height: 8px;
      }
    }
  }
}

.custom-fee-result {
  background: #F0F7F9;
  border: 1px solid #D9DFE5;
  display: flex;
  margin-top: 30px;
  padding: 10px;
  flex-direction: column;

  .custom-fee-result-title {
    font-weight: 500;
    font-size: 14px;
    line-height: 26px;
  }

  .custom-fee-result-time,
  .custom-fee-result-amount,
  .custom-fee-result-fiat {
    font-style: normal;
    font-weight: 300;
    font-size: 12px;
    line-height: 16px;

  }

  .custom-fee-result-fiat {
    color: #646F85;
  }
}
</style>
