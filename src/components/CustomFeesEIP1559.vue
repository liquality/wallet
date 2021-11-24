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
        <span>GWEI <span>{{ baseFee }}</span></span>
      </div>

      <div class="custom-fee-inputs">
        <div class="input-wrapper">
          <p><strong>MINER TIP</strong> TO SPEED UP</p>
          <span>${{tipFiat}}</span>
          <div class="custom-fee-details-item">
            <div class="gas-unit-label">{{ gasUnit.toUpperCase() }}</div>
            <div class="input-group">
              <input
                type="number"
                class="form-control"
                id="custom_fee_input_field"
                :step="stepSize"
                :value="tipFee"
                @input="
                  setTipFee(parseFloat($event.target.value))
                "
              />
              <div class="input-group-text fee-input-controls">
                <ChevronUpIcon @click="incrementTipFee()" />
                <ChevronDownIcon @click="decrementTipFee()" />
              </div>
            </div>
          </div>
        </div>
        <div class="input-wrapper">
          <p><strong>MAX FEE</strong> PER GAS</p>
          <span>${{maxFiat}}</span>
          <div class="custom-fee-details-item">
            <div class="gas-unit-label">{{ gasUnit.toUpperCase() }}</div>
            <div class="input-group">
              <input
                type="number"
                class="form-control"
                id="custom_fee_input_field"
                :step="stepSize"
                :value="maxFee"
                @input="
                  setMaxFee(parseFloat($event.target.value))
                "
              />
              <div class="input-group-text fee-input-controls">
                <ChevronUpIcon @click="incrementMaxFee()" />
                <ChevronDownIcon @click="decrementMaxFee()" />
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

      <div  class="error-messages-wrapper">
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

      <div
        class="custom-fee-result"
        id="custom_speed_fee_results"
      >
        <div class="custom-fee-result-title">New Speed/Fee</div>
        <div class="custom-fee-result-amount">{{ customFeeAmount }}</div>
        <div class="custom-fee-result-fiat" v-if="customFiatAmount">
          {{ customFiatAmount }}
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
import { getAssetIcon } from '@/utils/asset'
import NavBar from '@/components/NavBar'
import { getFeeLabel, getSendFee } from '@/utils/fees'
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
      preset: null,
      fee: null,
      baseFee: null,
      tipFee: null,
      maxFee: null,
      hasError: false
    }
  },
  props: ['asset', 'selectedFee', 'fees', 'totalFees', 'fiatRates'],
  created () {
    this.preset = this.selectedFee || 'average'
    this.baseFee = this.fees[this.preset].fee.baseFee
    this.tipFee = this.fees[this.preset].fee.maxPriorityFeePerGas
    this.maxFee = this.fees[this.preset].fee.maxFeePerGas
  },
  computed: {
    getTotalFee () {
      return this.baseFee + this.tipFee
    },
    noTipError () {
      return !this.tipFee
        ? 'Miner tip must be greater than 0 GWEI'
        : null
    },
    veryLowTipError () {
      return !this.noTipError && this.tipFee < this.fees.slow.fee.maxPriorityFeePerGas
        ? 'Miner tip is extremely low and the transaction could fail. Use ‘Low’.'
        : null
    },
    veryHighTipWarning () {
      return this.tipFee > this.fees.fast.fee.maxPriorityFeePerGas
        ? 'Miner tip is higher than necessary. You may pay more than needed. Use ‘High’.'
        : null
    },
    noMaxFeeError () {
      return !this.maxFee ? 'Max fee must be greater than 0 GWEI' : null
    },
    veryLowMaxFeeError () {
      return this.maxFee < this.fees.slow.fee.maxFeePerGas
        ? `Max fee too low. Must be > ${this.fees.slow.fee.maxFeePerGas} GWEI (Base Fee plus Miner Tip).`
        : null
    },
    veryHighFeeWarning () {
      return this.maxFee > this.fees.fast.fee.maxFeePerGas
        ? `Max fee is higher than necessary ${this.fees.fast.fee.maxFeePerGas} GWEI (Base Fee plus Miner Tip). Review  your maximum ‘New Fee Total’.`
        : null
    },
    nativeAsset () {
      return 'ETH'
    },
    gasUnit () {
      return 'gwei'
    },
    customFiatAmount () {
      return this.getFiatAmount()
    },
    customFeeAmount () {
      return this.getFeeAmount()
    },
    stepSize () {
      return 1
    },
    tipFiat () {
      const fiat = prettyFiatBalance(
        getSendFee(this.nativeAsset, this.tipFee),
        this.fiatRates[this.nativeAsset]
      )
      return isNaN(fiat) ? 0 : fiat
    },
    maxFiat () {
      const fiat = prettyFiatBalance(
        getSendFee(this.nativeAsset, this.maxFee),
        this.fiatRates[this.nativeAsset]
      )
      return isNaN(fiat) ? 0 : fiat
    },
    baseSendAmount () {
      return getSendFee(this.nativeAsset, this.baseFee)
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
        fee: this.tipFee
      })
    },
    setTipFee (fee) {
      this.tipFee = fee
      this.$emit('update', {
        asset: this.asset,
        fee: this.tipFee
      })
    },
    setMaxFee (fee) {
      this.maxFee = fee
      this.$emit('update', {
        asset: this.asset,
        fee: this.maxFee
      })
    },
    incrementTipFee () {
      this.setTipFee(this.tipFee + this.stepSize)
    },
    incrementMaxFee () {
      this.setMaxFee(this.maxFee + this.stepSize)
    },
    decrementTipFee () {
      if (this.tipFee) {
        this.setTipFee(this.tipFee - this.stepSize)
      }
    },
    decrementMaxFee () {
      if (this.maxFee) {
        this.setMaxFee(this.maxFee - this.stepSize)
      }
    },
    setPreset (name) {
      this.preset = name
      this.tipFee = this.fees[name]?.fee.maxPriorityFeePerGas
    },
    getFeeAmount (name) {
      if (!name) name = this.preset || 'custom'
      if (this.totalFees && this.totalFees[name]) {
        const totalFee = this.totalFees[name].plus(this.baseSendAmount)
        return `${BN(totalFee).dp(6)} ${this.nativeAsset}`
      } else {
        const chainId = cryptoassets[this.asset].chain
        const { unit } = chains[chainId].fees
        return `${this.getTotalFee || 0} ${unit}`
      }
    },
    getFiatAmount (name) {
      if (!name) name = this.preset || 'custom'
      if (this.totalFees && this.totalFees[name]) {
        const totalFiat = prettyFiatBalance(
          this.totalFees[name].plus(this.baseSendAmount),
          this.fiatRates[this.nativeAsset]
        )
        return `${totalFiat || 0} USD`
      }
      return ''
    }
  },
  watch: {
    tipFee (val) {
      if (this.fees) {
        this.preset = {
          [this.fees?.slow?.fee.maxPriorityFeePerGas]: 'slow',
          [this.fees?.average?.fee.maxPriorityFeePerGas]: 'average',
          [this.fees?.fast?.fee.maxPriorityFeePerGas]: 'fast'
        }[val || 0]
      }
    }
  }
}
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

    & input[type="number"]::-webkit-inner-spin-button,
    & input[type="number"]::-webkit-outer-spin-button {
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
