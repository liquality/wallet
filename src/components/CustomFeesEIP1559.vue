<template>
  <div class="swap">
    <NavBar :showBackButton="false" :showBack="false" :showMenuList="false"> EDIT GAS FEE </NavBar>

    <div class="view-wrapper">
      <div :class="{ selectedView: view === 'basic' }">
        <p v-on:click="changeView('basic')">BASIC</p>
      </div>
      <div :class="{ selectedView: view === 'custom' }">
        <p v-on:click="changeView('custom')">CUSTOMIZE</p>
      </div>
    </div>

    <div class="wrapper form" :class="{ wrapperSend: padLabels }">
      <div class="wrapper_top">
        <div class="selected-asset" id="custom_fee_selected_asset">
          <img :src="getAssetIcon(asset)" class="asset-icon" />
          <span class="asset-name">
            {{ asset }}
          </span>
        </div>
      </div>

      <div class="basic-wrapper" v-if="view === 'basic'">
        <p class="presets-title">PRESETS</p>
        <div class="presets-wrapper">
          <div
            :class="{ selectedPreset: basicPreset === 'slow' }"
            v-on:click="selectPreset('slow')"
          >
            <p class="basicPreset-type">Slow</p>
            <p class="basicPreset-time slow">~maybe in 30 sec</p>
            <p>{{ slowPreset.amount }} {{ asset }}</p>
            <p>{{ slowPreset.fiat }} USD</p>
            <p>max {{ slowPreset.maximum }} USD</p>
          </div>
          <div
            class="basic-average"
            :class="{ selectedPreset: basicPreset === 'average' }"
            v-on:click="selectPreset('average')"
          >
            <p class="basicPreset-type">Average</p>
            <p class="basicPreset-time">~likely in &lt; 30 sec</p>
            <p>{{ averagePreset.amount }} {{ asset }}</p>
            <p>{{ averagePreset.fiat }} USD</p>
            <p>max {{ averagePreset.maximum }} USD</p>
          </div>
          <div
            :class="{ selectedPreset: basicPreset === 'fast' }"
            v-on:click="selectPreset('fast')"
          >
            <p class="basicPreset-type">Fast</p>
            <p class="basicPreset-time">~likely in &lt; 15 sec</p>
            <p>{{ fastPreset.amount }} {{ asset }}</p>
            <p>{{ fastPreset.fiat }} USD</p>
            <p>max {{ fastPreset.maximum }} USD</p>
          </div>
        </div>
      </div>

      <!-- Customized -->

      <div v-else-if="view === 'custom'">
        <div class="current-base-fee">
          <span class="custom-fee-title">
            <strong>CURRENT BASE FEE PER GAS</strong>
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
              <span class="gas-unit-label" :class="{ gasUnitLabel: padLabels }">{{
                gasUnit.toUpperCase()
              }}</span>
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  v-bind:class="{
                    errorInput: noTipError || veryLowTipError,
                    warningInput: veryHighTipWarning
                  }"
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
              <span class="gas-unit-label" :class="{ gasUnitLabel: padLabels }">{{
                gasUnit.toUpperCase()
              }}</span>
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  v-bind:class="{
                    errorInput: veryLowMaxFeeError,
                    warningInput: veryHighFeeWarning
                  }"
                  id="custom_fee_input_field_new"
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
            v-for="preset in [
              { label: 'Low', value: 'slow' },
              { label: 'Med', value: 'average' },
              { label: 'High', value: 'fast' }
            ]"
            :id="preset.label"
            :key="preset.label"
            :class="{ selected: preset.value === customizePreset }"
            @click="setCustomizePreset(preset.value)"
          >
            {{ preset.label }}
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
          <div class="custom-fee-result-title">New Fee Total</div>
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
      basicPreset: null,
      customizePreset: null,
      fee: null,
      suggestedBaseFeePerGas: null,
      tipFee: null,
      maxFee: null,
      hasError: false,
      view: 'basic'
    }
  },
  props: ['asset', 'selectedFee', 'fees', 'totalFees', 'fiatRates', 'padLabels'],
  created() {
    this.basicPreset = this.selectedFee || 'average'
    this.customizePreset = 'Med'
    this.suggestedBaseFeePerGas = this.fees[this.basicPreset].fee.suggestedBaseFeePerGas
    this.tipFee = this.fees[this.basicPreset].fee.maxPriorityFeePerGas
    this.maxFee = this.fees[this.basicPreset].fee.maxFeePerGas
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
    slowPreset() {
      const slowPreset = this.fees?.slow || {}

      const defaultFee =
        slowPreset.fee?.suggestedBaseFeePerGas + slowPreset.fee?.maxPriorityFeePerGas || 0
      const maximumFee = slowPreset.fee?.suggestedBaseFeePerGas + slowPreset.fee?.maxFeePerGas || 0
      const sendFee = getSendFee(this.nativeAsset, defaultFee)

      return {
        amount: BN(sendFee).dp(6),
        fiat: prettyFiatBalance(this.totalFees.slow, this.fiatRates[this.nativeAsset]),
        maximum: prettyFiatBalance(
          getSendFee(this.nativeAsset, maximumFee),
          this.fiatRates[this.nativeAsset]
        )
      }
    },
    averagePreset() {
      const averagePreset = this.fees?.average || {}

      const defaultFee =
        averagePreset.fee?.suggestedBaseFeePerGas + averagePreset.fee?.maxPriorityFeePerGas || 0
      const maximumFee =
        averagePreset.fee?.suggestedBaseFeePerGas + averagePreset.fee?.maxFeePerGas || 0
      const sendFee = getSendFee(this.nativeAsset, defaultFee)

      return {
        amount: BN(sendFee).dp(6),
        fiat: prettyFiatBalance(this.totalFees.average, this.fiatRates[this.nativeAsset]),
        maximum: prettyFiatBalance(
          getSendFee(this.nativeAsset, maximumFee),
          this.fiatRates[this.nativeAsset]
        )
      }
    },
    fastPreset() {
      const fastPreset = this.fees?.fast || {}

      const defaultFee =
        fastPreset.fee?.suggestedBaseFeePerGas + fastPreset.fee?.maxPriorityFeePerGas || 0
      const maximumFee = fastPreset.fee?.suggestedBaseFeePerGas + fastPreset.fee?.maxFeePerGas || 0
      const sendFee = getSendFee(this.nativeAsset, defaultFee)

      return {
        amount: BN(sendFee).dp(6),
        fiat: prettyFiatBalance(this.totalFees.fast, this.fiatRates[this.nativeAsset]),
        maximum: prettyFiatBalance(
          getSendFee(this.nativeAsset, maximumFee),
          this.fiatRates[this.nativeAsset]
        )
      }
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
      return this.fees[this.customizePreset]?.fee.maxPriorityFeePerGas || this.tipFee
    },
    maximumFee() {
      return this.fees[this.customizePreset]?.fee.maxFeePerGas || this.maxFee
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
    changeView(view) {
      this.view = view
    },
    selectPreset(basicPreset) {
      this.basicPreset = basicPreset
      this.tipFee = this.fees[basicPreset].fee.maxPriorityFeePerGas
      this.maxFee = this.fees[basicPreset].fee.maxFeePerGas
    },
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
    setCustomizePreset(preset) {
      this.customizePreset = preset
      this.tipFee = this.fees[preset]?.fee.maxPriorityFeePerGas
    }
  },
  watch: {
    tipFee(val) {
      if (this.fees) {
        this.customizePreset = {
          [this.fees?.slow?.fee.maxPriorityFeePerGas]: 'slow',
          [this.fees?.average?.fee.maxPriorityFeePerGas]: 'average',
          [this.fees?.fast?.fee.maxPriorityFeePerGas]: 'fast'
        }[val || 0]
      }
    },
    maxFee(val) {
      if (this.fees) {
        this.customizePreset = {
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
.view-wrapper {
  display: flex;
  align-items: flex-end;
  border-bottom: 1px solid #d9dfe5;
  height: 40px;

  div {
    width: 180px;
    text-align: center;

    p {
      font-weight: bold;
      cursor: pointer;
      margin-bottom: 6px;
      color: #646f85;
    }
  }

  .selectedView {
    border-bottom: 1px solid #000000;

    p {
      color: #000000;
    }
  }
}
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

.basicPreset-type {
  font-size: 14px;
}

.basicPreset-time {
  font-size: 10px;

  color: #088513;
}

.slow {
  color: #ff007a;
}

.basic-wrapper {
  .presets-title {
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 10px;
  }

  p {
    margin-bottom: 0;
  }

  .presets-wrapper {
    display: flex;
    border: 1px solid #d9dfe5;
    cursor: pointer;

    div {
      padding: 5px;
      width: 106.666666667px;
    }

    .selectedPreset {
      background-color: #d9dfe5;
    }
  }
}

.basic-average {
  border-left: 1px solid #d9dfe5;
  border-right: 1px solid #d9dfe5;
}

#custom_fee_input_field {
  width: 0;
}

.wrapperSend {
  padding: 10px;
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
      position: relative;
      bottom: 4px;

      span {
        width: 34px;
        position: relative;
        top: 15px;
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
    font-size: 17px;
    line-height: 24px;
    position: relative;
    bottom: 3px;
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
      position: relative;
      top: 18px;
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
    font-weight: bold;
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
.gasUnitLabel {
  right: 60px;
}
</style>
