<template>
  <div class="permission-send wrapper form text-center">
    <div v-if="currentStep === 'inputs'" class="wrapper_top form">
      <div v-if="error" class="mt-4 text-danger"><strong>Error:</strong> {{ error }}</div>
      <div v-if="isApprove">
        <div class="form-group">
        <label>{{label}}</label>
        <label>{{subLabel}}</label>
        <p class="confirm-value" :style="getAssetColorStyle(asset)">{{symbol}}</p>
      </div>
      <div class="form-group">
        <label>Transaction fee {{feeInUsdValue}} USD</label>
      </div>
      </div>
      <div v-else>
      <div class="form-group">
        <label>{{label}}</label>
        <p class="confirm-value" :style="getAssetColorStyle(asset)">{{amount}} {{symbol}}</p>
        <p class="text-muted">${{prettyFiatBalance(amount, fiatRates[asset])}}</p>
      </div>
      <div class="form-group">
        <label>To</label>
        <p class="confirm-value">{{shortAddress}}</p>
      </div>
      <div class="form-group">
        <label>Transaction fee {{feeInUsdValue}} USD</label>
      </div>
      <div v-if="data" class="permission-send_data">
        <label @click="toggleshowData"><ChevronDown v-if="showData" class="permission-send_data_icon-down" /><ChevronRight class="permission-send_data_icon-right" v-else />Data</label>
        <div class="permission-send_data_code" v-if="showData">{{data}}</div>
      </div>
   
      </div>

      <div class="form-group mt-4">
        <label>Network Speed / Fee</label>
        <div class="permission-send_fees">
          <FeeSelector
            :asset="asset"
            v-model="selectedFee"
            v-bind:fees="assetFees"
            v-bind:fiatRates="fiatRates"
            @custom-selected="onCustomFeeSelected(asset)"
            />
        </div>
      </div>
    </div>
    
    
  <div class="send" v-else-if="currentStep === 'custom-fees'">
      <CustomFees
        @apply="applyCustomFee"
        @update="setCustomFee"
        @cancel="cancelCustomFee"
        :asset="assetChain"
        :selected-fee="selectedFee"
        :fees="assetFees"
        :totalFees="maxOptionActive ? maxSendFees : sendFees"
        :fiatRates="fiatRates"
      />
    </div>

    <div v-if="currentStep === 'inputs'" class="wrapper_bottom">
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="reply(false)">Cancel</button>
        <button class="btn btn-primary btn-lg btn-icon" @click.stop="reply(true)" :disabled="loading">
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else>Confirm</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
import { currencyToUnit, unitToCurrency } from '@liquality/cryptoassets'
import FeeSelector from '@/components/FeeSelector'
import CustomFees from '@/components/CustomFees'
import { prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import { getNativeAsset, getAssetColorStyle } from '@/utils/asset'
import { parseTransactionData } from '@/utils/txData'
import { tokenDetailProviders } from '@/utils/asset'
import { shortenAddress } from '@/utils/address'
import {
  getSendFee
} from '@/utils/fees'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ChevronDown from '@/assets/icons/chevron_down.svg'
import ChevronRight from '@/assets/icons/chevron_right.svg'
import BN from 'bignumber.js'
import _ from 'lodash'

const TRANSACTION_TYPES = {
  approve: 'Allow',
  send: 'Send'
}

export default {
  components: {
    SpinnerIcon,
    ChevronDown,
    ChevronRight,
    FeeSelector,
    CustomFees
  },
  data () {
    return {
      sendFees: {},
      maxSendFees: {},
      showData: false,
      selectedFee: 'average',
      error: null,
      loading: false,
      replied: false,
      maxOptionActive: false,
      symbol: '',
      label: '',
      subLabel: '',
      isApprove: false,
      currentStep: 'inputs'
    }
  },
  methods: {
    ...mapActions(['replyPermission', 'updateFees']),
    prettyBalance,
    prettyFiatBalance,
    getAssetColorStyle,
    toggleshowData () {
      this.showData = !this.showData
    },
    onCustomFeeSelected () {
      this.currentStep = 'custom-fees'
    },
    cancelCustomFee () {
      this.currentStep = 'inputs'
      this.selectedFee = 'average'
    },
    async getSymbol() {
      if(this.assetChain === 'ETH') {
        try {
        const data = await tokenDetailProviders.ethereum.getDetails(this.request.args[0].to)
          this.symbol = data.symbol
        } catch (err) {
          this.symbol = 'ETH'
        }
      } else {
        this.symbol = this.asset
      }
    },
    async getLabel() {
      const txType = parseTransactionData(this.request.args[0]?.data)?.name || 'send'
      if (txType === 'approve' && chrome.tabs?.query) {
        this.isApprove = true;
        
        chrome.tabs.query({active: true, lastFocusedWindow: true}, async tabs => {
          if(!tabs) return

          const origin = tabs[0].url.split('&').find(e => e.includes('origin'))
          const url = decodeURIComponent(origin.split('=')[1])
          this.label = `${TRANSACTION_TYPES[txType]}`
          this.subLabel = `${url} to spend your`
        })
      } else if (txType === 'send') {
        this.label = TRANSACTION_TYPES[txType]
      }
    },
    async reply (allowed) {
      const fee = this.feesAvailable ? this.assetFees[this.selectedFee].fee : undefined
      const optionsWithFee = { ...this.request.args[0], value: this.value, fee }

      const requestWithFee = {
        ...this.request,
        args: [optionsWithFee]
      }

      this.loading = true
      this.error = null

      try {
        const response = await this.replyPermission({
          request: requestWithFee,
          allowed
        })
        this.replied = true
        if (response.error) {
          this.error = response.error
        } else {
          window.close()
        }
      } finally {
        this.loading = false
      }
    },

    async _updateSendFees (amount) {
      const getMax = amount === undefined
      if (this.feesAvailable) {
        const sendFees = {}
        for (const [speed, fee] of Object.entries(this.assetFees)) {
          const gas = BN(this.request.args[0].gas, 16)
          const feePerGas = BN(fee.fee).div(1e9)
          const txCost = gas.times(feePerGas)
          sendFees[speed] = txCost
        }
        
        if (getMax) {
          this.maxSendFees = sendFees
        } else {
          this.sendFees = sendFees
        }
      }
      
    },
    applyCustomFee ({ fee }) {
      const presetFee = Object.entries(this.assetFees).find(([speed, speedFee]) => speed !== 'custom' && speedFee.fee === fee)
      if (presetFee) {
        const [speed] = presetFee
        this.selectedFee = speed
        this.customFee = null
      } else {
        this.updateMaxSendFees()
        this.updateSendFees(this.amount)
        this.customFee = fee
        this.selectedFee = 'custom'
      }
      this.currentStep = 'inputs'
    },
    updateSendFees: _.debounce(async function (amount) {
      await this._updateSendFees(amount)
    }, 800),
    async updateMaxSendFees () {
      await this._updateSendFees()
    },
    setCustomFee: _.debounce(async function ({ fee }) {
      this.customFee = fee
      if (this.maxOptionActive) {
        this.updateMaxSendFees()
      } else {
        this.updateSendFees(this.amount)
      }
    }, 800),
    
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId', 'fees', 'fiatRates']),
    ...mapGetters([
      'client'
    ]),
    asset () {
      return this.request.asset
    },
    assetChain () {
      return getNativeAsset(this.asset)
    },
    address () {
      return this.request.args[0].to
    },
    shortAddress () {
      return this.address ? shortenAddress(this.address) : 'New Contract'
    },
    value () {
      // Parse SendOptions.value into BN
      const value = this.request.args[0].value
      return BN(value ? '0x' + value : 0)
    },
    amount () {
      if (!this.value) return 0
      return unitToCurrency(cryptoassets[this.asset], this.value).toNumber()
    },
    data () {
      return this.request.args[0].data
    },
    assetFees () {
      const assetFees = {}
      if (this.customFee) {
        assetFees.custom = { fee: this.customFee }
      }

      const fees = this.fees[this.activeNetwork]?.[this.activeWalletId]?.[
        this.assetChain
      ]
      if (fees) {
        Object.assign(assetFees, fees)
      }

      return assetFees
    },
    feeInUsdValue() {
      const gas = BN(this.request.args[0].gas, 16)
      const feePerGas = BN(this.fees[this.activeNetwork]?.[this.activeWalletId]?.[this.assetChain][this.selectedFee].fee).div(1e9)
      const txCost = gas.times(feePerGas)
       
      return prettyFiatBalance(txCost, this.fiatRates[this.assetChain])
    },
    feesAvailable () {
      return this.assetFees && Object.keys(this.assetFees).length
    },
    request () {
      return {
        ...this.$route.query,
        args: JSON.parse(this.$route.query.args)
      }
    },
  },
  async created () {
    await this.getSymbol()
    // this.getLabel()
    await this.updateFees({ asset: this.asset })
    await this.updateSendFees(0)
    await this.updateMaxSendFees()
  },
  beforeDestroy () {
    // TODO: need to reply correctly when window is closed
    if (this.replied) return

    this.reply(false)
  }
}
</script>

<style lang="scss">
.send {
  &_asset {
    &.input-group {
      align-items: center;
    }

    &_icon {
      margin-right: 4px;
    }

    input {
      text-align: right;
      margin-left: 12px;
    }
  }
  &_fees {
    display: flex;
    align-items: center;
    font-weight: bold;
    margin: 6px 0;
    .fee-selector {
      margin-left: 6px;
    }
    .custom-fees {
      font-weight: normal;
    }

  }
}
.permission-send {
  &_fees {
    text-align: center;
    margin: 6px 0;
  }

  &_data {
    border-top: 1px solid $hr-border-color;
    border-bottom: 1px solid $hr-border-color;
    padding: 10px 0;

    &_icon-right {
      width: 6px;
      margin-right: 12px;
    }

    &_icon-down {
      width: 12px;
      margin-right: 6px;
    }

    label {
      display: flex;
      align-items: center;
      text-align: left;
    }

    &_code {
      margin-left: 18px;
      max-height: 120px;
      text-align: left;
      overflow-y: auto;
      word-wrap: break-word;
      font-size: $font-size-sm;
    }
  }
}
</style>
