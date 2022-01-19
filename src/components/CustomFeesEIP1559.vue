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
      </div>

      <!-- Customized -->

      <div class="current-base-fee">
        <span class="custom-fee-title">
          <strong>CURRENT BASE FEE</strong>
          PER GAS
        </span>
        <span
          >GWEI <span>{{ suggestedBaseFeePerGas }}</span></span
        >
      </div>

      <div class="custom-fee-inputs">
        <div class="input-wrapper">
          <p><strong>MINER TIP</strong> TO SPEED UP</p>
          <span>${{ minerTipFiat }}</span>
          <div class="custom-fee-details-item">
            <div class="gas-unit-label">{{ gasUnit.toUpperCase() }}</div>
            <div class="input-group">
              <input
                type="number"
                class="form-control"
                v-bind:class="{ errorInput: noTipError || veryLowTipError, warningInput: veryHighTipWarning }"
                id="custom_fee_input_field"
                :step="stepSize"
                :value="formatedMinerTip"
                @input="setTipFee(parseFloat($event.target.value))"
              />
              <div class="input-group-text fee-input-controls">
                <ChevronUpIcon @click="incrementMinerTipFee()" />
                <ChevronDownIcon @click="decrementMinerTipFee()" />
              </div>
            </div>
          </div>
        </div>
        <div class="input-wrapper">
          <p><strong>MAX FEE</strong> PER GAS</p>
          <span>${{ maxFiat }}</span>
          <div class="custom-fee-details-item">
            <div class="gas-unit-label">{{ gasUnit.toUpperCase() }}</div>
            <div class="input-group">
              <input
                type="number"
                class="form-control"
                v-bind:class="{ errorInput: veryLowMaxFeeError, warningInput: veryHighFeeWarning }"
                id="custom_fee_input_field"
                :step="stepSize"
                :value="formatedMaximum"
                @input="setMaxFee(parseFloat($event.target.value))"
              />
              <div class="input-group-text fee-input-controls">
                <ChevronUpIcon @click="incrementMaximumFee()" />
                <ChevronDownIcon @click="decrementMaximumFee()" />
              </div>
            </div>
          </div>

          <!-- Result -->
        </div>
      </div>

      <div class="speed-wrapper">
        <button
          class="custom-fee-presets-option"
          v-for="name in ['slow', 'average', 'fast']"
          :id="name"
          :key="name"
          :class="{ selected: name === preset }"
          @click="setPreset(name)"
        >
          {{ getFeeLabel(name) }}
        </button>
      </div>

      <div class="error-messages-wrapper">
        <p class="error" v-if="noTipError">{{ noTipError }}</p>
        <p class="error" v-if="veryLowTipError">{{ veryLowTipError }}</p>
        <p class="warning" v-if="veryHighTipWarning">
          {{ veryHighTipWarning }}
        </p>
        <p class="error" v-if="veryLowMaxFeeError">{{ veryLowMaxFeeError }}</p>
        <p class="warning" v-if="veryHighFeeWarning">
          {{ veryHighFeeWarning }}
        </p>
      </div>

      <div class="custom-fee-result" id="custom_speed_fee_results">
        <div class="custom-fee-result-title">New Speed/Fee</div>
        <div class="custom-fee-estimation">
          <div>
            <span>minimum</span>
            <span>~Likely in &lt; 30 sec</span>
            <div class="custom-fee-result-amount">~{{ minimum.amount }}</div>
            <div class="custom-fee-result-fiat" v-if="minimum.fiat">~{{ minimum.fiat }} USD</div>
          </div>
          <div>
            <span>maximum</span>
            <span>~Likely in &lt; 15 sec</span>
            <div class="custom-fee-result-amount">~{{ maximum.amount }}</div>
            <div class="custom-fee-result-fiat" v-if="maximum.fiat">~{{ maximum.fiat }} USD</div>
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
            :disabled="!tipFee || !maxFee"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAssetIcon, getFeeAsset, getNativeAsset } from '@/utils/asset'
import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'
import NavBar from '@/components/NavBar'
import BN from 'bignumber.js'
import { getFeeLabel, getSendFee } from '@/utils/fees'
import { prettyFiatBalance } from '@/utils/coinFormatter'
import ChevronUpIcon from '@/assets/icons/chevron_up.svg'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'

export default {
  components: {
    NavBar,
    ChevronUpIcon,
    ChevronDownIcon
  },
  data() {
    return {
      preset: null,
      fee: null,
      suggestedBaseFeePerGas: null,
      tipFee: null,
      maxFee: null,
      hasError: false
    }
  },
  props: ['asset', 'selectedFee', 'fees', 'totalFees', 'fiatRates'],
  created() {
    this.preset = this.selectedFee || 'average'
    this.suggestedBaseFeePerGas = this.fees[this.preset].fee.suggestedBaseFeePerGas
    this.tipFee = this.fees[this.preset].fee.maxPriorityFeePerGas
    this.maxFee = this.fees[this.preset].fee.maxFeePerGas
  },
  computed: {
    noTipError() {
      return !this.tipFee ? 'Miner tip must be greater than 0 GWEI' : null
    },
    veryLowTipError() {
      return !this.noTipError && this.tipFee < this.fees.slow.fee.maxPriorityFeePerGas
        ? 'Miner tip is extremely low and the transaction could fail. Use ‘Low’.'
        : null
    },
    veryHighTipWarning() {
      return this.tipFee > this.fees.fast.fee.maxPriorityFeePerGas
        ? 'Miner tip is higher than necessary. You may pay more than needed. Use ‘High’.'
        : null
    },
    noMaxFeeError() {
      return !this.maxFee ? 'Max fee must be greater than 0 GWEI' : null
    },
    veryLowMaxFeeError() {
      return this.maxFee < this.fees.slow.fee.maxFeePerGas
        ? `Max fee too low. Must be > ${this.fees.slow.fee.maxFeePerGas} GWEI (Base Fee plus Miner Tip).`
        : null
    },
    veryHighFeeWarning() {
      return this.maxFee > this.fees.fast.fee.maxFeePerGas
        ? `Max fee is higher than necessary ${this.fees.fast.fee.maxFeePerGas} GWEI (Base Fee plus Miner Tip). Review  your maximum ‘New Fee Total’.`
        : null
    },
    nativeAsset() {
      return getFeeAsset(this.asset) || getNativeAsset(this.asset)
    },
    gasUnit() {
      const chainId = cryptoassets[this.asset]?.chain
      if (chainId) {
        const { unit } = chains[chainId]?.fees || ''
        return getFeeAsset(this.asset) || unit
      }
      return ''
    },
    stepSize() {
      return 1
    },
    minerTip() {
      return this.fees[this.preset]?.fee.maxPriorityFeePerGas || this.tipFee
    },
    maximumFee() {
      return this.fees[this.preset]?.fee.maxFeePerGas || this.maxFee
    },
    minerTipFiat() {
      const fiat = prettyFiatBalance(
        getSendFee(this.nativeAsset, this.minerTip),
        this.fiatRates[this.nativeAsset]
      )
      return isNaN(fiat) ? 0 : fiat
    },
    maxFiat() {
      const fiat = prettyFiatBalance(
        getSendFee(this.nativeAsset, this.maximumFee),
        this.fiatRates[this.nativeAsset]
      )
      return isNaN(fiat) ? 0 : fiat
    },
    minimum() {
      const minimumFee = this.minerTip + this.suggestedBaseFeePerGas
      const totalMinFee = getSendFee(this.nativeAsset, minimumFee).plus(this.totalFees.slow)
      return {
        amount: BN(totalMinFee).dp(6),
        fiat: prettyFiatBalance(this.totalFees.slow, this.fiatRates[this.nativeAsset])
      }
    },
    maximum() {
      const maximumFee = this.maximumFee
      const totalMaxFee = getSendFee(this.nativeAsset, maximumFee).plus(this.totalFees.fast)
      return {
        amount: BN(totalMaxFee).dp(6),
        fiat: prettyFiatBalance(this.totalFees.fast, this.fiatRates[this.nativeAsset])
      }
    },
    formatedMinerTip() {
      return BN(this.minerTip).dp(6)
    },
    formatedMaximum() {
      return BN(this.maximumFee).dp(6)
    }
  },
  methods: {
    getFeeLabel,
    getAssetIcon,
    cancel() {
      this.$emit('cancel')
    },
    apply() {
      this.$emit('apply', {
        asset: this.asset,
        fee: {
          maxPriorityFeePerGas: this.minerTip,
          maxFeePerGas: this.maximumFee
        }
      })
    },
    setTipFee(fee) {
      this.tipFee = fee
      this.$emit('update', {
        asset: this.asset,
        fee: {
          maxPriorityFeePerGas: this.minerTip,
          maxFeePerGas: this.maximumFee
        }
      })
    },
    setMaxFee(fee) {
      this.maxFee = fee
      this.$emit('update', {
        asset: this.asset,
        fee: {
          maxPriorityFeePerGas: this.minerTip,
          maxFeePerGas: this.maximumFee
        }
      })
    },
    incrementMinerTipFee() {
      this.setTipFee(this.tipFee + this.stepSize)
    },
    decrementMinerTipFee() {
      if (this.tipFee) {
        this.setTipFee(this.tipFee - this.stepSize)
      }
    },
    incrementMaximumFee() {
      this.setMaxFee(this.maxFee + this.stepSize)
    },
    decrementMaximumFee() {
      if (this.maxFee) {
        this.setMaxFee(this.maxFee - this.stepSize)
      }
    },
    setPreset(name) {
      this.preset = name
      this.tipFee = this.fees[name]?.fee.maxPriorityFeePerGas
    },
    
  },
  watch: {
    tipFee(val) {
      if (this.fees) {
        this.preset = {
          [this.fees?.slow?.fee.maxPriorityFeePerGas]: 'slow',
          [this.fees?.average?.fee.maxPriorityFeePerGas]: 'average',
          [this.fees?.fast?.fee.maxPriorityFeePerGas]: 'fast'
        }[val || 0]
      }
    },
    maxFee(val) {
      if (this.fees) {
        this.preset = {
          [this.fees?.slow?.fee.maxFeePerGas]: 'slow',
          [this.fees?.average?.fee.maxFeePerGas]: 'average',
          [this.fees?.fast?.fee.maxFeePerGas]: 'fast'
        }[val || 0]
      }
    }
  }
}

// Lower bound = suggestedBaseFeePerGas + maxPriorityFeePerGas
// Upper bound = maxFeePerGas
</script>

<style lang="scss" scoped>
.fee-tabs {
  display: flex;
  align-items: center;

  .fee-tab {
    width: 50%;
    text-align: center;
    line-height: 18px;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    padding-top: 15px;
    height: 50px;
    border-bottom: 1px solid #d9dfe5;
  }

  .selected {
    font-weight: 600;
    border-bottom: 1px solid #1d1e21;
  }
}

#custom_fee_input_field {
  width: 0;
}

.wrapper {
  overflow-y: auto;
  height: auto;
}

.wrapper_top {
  flex: 0;
}

.custom-fee-inputs {
  display: flex;

  .input-wrapper {
    display: flex;
    flex-direction: column;
    width: 200px;

    &:last-child {
      margin-left: 17px;
    }

    p {
      margin-bottom: 0;
    }

    span {
      text-align: right;
      width: 136px;
    }

    div {
      display: flex;
      align-items: center;

      span {
        width: 34px;
      }

      input {
        width: 100px;
        font-size: 14px !important;
        line-height: 18px !important;
        text-align: right;
      }
    }
  }
}

.input-group-text {
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

.speed-wrapper {
  width: 50%;
  display: flex;
  justify-content: space-between;
  margin-top: 20px;

  button {
    border: 1px solid #d9dfe5;
    border-radius: 26px;
    width: 45px;
    background-color: transparent;
  }

  .selected {
    background-color: #f0f7f9;
  }
}

.error-messages-wrapper {
  margin-top: 1rem;

  .error {
    color: #ff007a;
  }

  .warning {
    color: #f57a08;
  }
}

.warningInput {
  color: #f57a08;
  border: 0 solid #f57a08;
  border-width: 0 0 1px 0;
}

.errorInput {
  color: #ff007a;
  border: 0 solid #ff007a;
  border-width: 0 0 1px 0;
}



.current-base-fee {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

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
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 20px;
    height: 25px;

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

  span {
    margin-left: 4px;
    font-weight: 500;
  }
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

    & input[type='number']::-webkit-inner-spin-button,
    & input[type='number']::-webkit-outer-spin-button {
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
    }
  }
}

.custom-fee-estimation {
  display: flex;
  justify-content: space-between;

  div {
    display: flex;
    flex-direction: column;
  }

  span {
    &:nth-of-type(2) {
      color: #088513;
    }
  }
}

.custom-fee-result {
  background: #f0f7f9;
  border: 1px solid #d9dfe5;
  display: flex;
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
    color: #646f85;
  }
}
</style>
