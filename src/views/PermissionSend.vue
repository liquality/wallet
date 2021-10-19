<template>
  <div class="permission-send wrapper form text-center">
    <div v-if="currentStep === 'inputs'"  class="wrapper_top form">
      <div v-if="error" class="mt-4 text-danger"><strong>Error:</strong> {{ error }}</div>
      <div v-if="isApprove">
        <div class="form-group">
        <label>{{label}}</label>
        <label>{{subLabel}}</label>
        <p class="confirm-value" :style="getAssetColorStyle(asset)">{{symbol}}</p>
      </div>
      <div class="form-group">
        <label v-if="feeInUsdValue">Transaction fee {{feeInUsdValue}} USD</label>
      </div>
      </div>

      <div v-else class="wrapper_top form">
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
          <label v-if="feeInUsdValue">Transaction fee {{feeInUsdValue}} USD</label>
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
import { unitToCurrency, chainToTokenAddressMap } from '@liquality/cryptoassets'
import FeeSelector from '@/components/FeeSelector'
import CustomFees from '@/components/CustomFees'
import { prettyBalance, prettyFiatBalance } from '@/utils/coinFormatter'
import { getNativeAsset, getAssetColorStyle, tokenDetailProviders, estimateGas } from '@/utils/asset'
import { parseTokenTx } from '@/utils/parseTokenTx'

import { shortenAddress } from '@/utils/address'
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
      showData: false,
      selectedFee: 'average',
      error: null,
      loading: false,
      replied: false,
      symbol: '',
      label: '',
      subLabel: '',
      isApprove: false,
      currentStep: 'inputs',
      sendFees: {},
      maxSendFees: {},
      maxOptionActive: false,
      customFee: null,
      gas: 0
    }
  },
  methods: {
    ...mapActions(['replyPermission', 'updateFees']),
    prettyBalance,
    prettyFiatBalance,
    getAssetColorStyle,
    onCustomFeeSelected () {
      this.currentStep = 'custom-fees'
    },
    cancelCustomFee () {
      this.currentStep = 'inputs'
      this.selectedFee = 'average'
    },
    toggleshowData () {
      this.showData = !this.showData
    },
    async getSymbol () {
      const chain = cryptoassets[this.asset].chain
      const tokenAddress = this.request.args[0].to

      try { // try to get token from cryptoassets
        this.symbol = chainToTokenAddressMap[chain][tokenAddress].code
      } catch { // in case token doesn't exist in cryptoassets
        try {
          const tokeData = await tokenDetailProviders[chain].getDetails(tokenAddress)
          this.symbol = tokeData.symbol + ' (Unverified)'
        } catch {
          this.symbol = this.assetChain
        }
      }
    },
    async getLabel () {
      try {
        const txType = parseTokenTx(this.request.args[0]?.data)?.name || 'send'

        switch (txType) {
          case 'approve': {
            this.isApprove = true
            this.label = `${TRANSACTION_TYPES[txType]}`
            this.subLabel = this.request.origin
            return
          } default: {
            this.label = TRANSACTION_TYPES.send
            return
          }
        }
      } catch {
        this.label = TRANSACTION_TYPES.send
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
      if (!this.gas) {
        return
      }

      const getMax = amount === undefined
      if (this.feesAvailable) {
        const sendFees = {}

        for (const [speed, fee] of Object.entries(this.assetFees)) {
          const feePerGas = BN(fee.fee).div(1e9)
          const txCost = this.gas.times(feePerGas)
          sendFees[speed] = txCost
        }

        if (getMax) {
          this.maxSendFees = sendFees
        } else {
          this.sendFees = sendFees
        }
      }
    },
    async estimateGas () {
      let gas = this.request.args[0].gas

      if (!gas) {
        const { data, to, value } = this.request.args[0]

        gas = await estimateGas({
          data,
          to,
          value
        })
      }

      return BN(gas, 16)
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
    async calculateGas () {
      this.gas = await this.estimateGas()
    }
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
    feesAvailable () {
      return this.assetFees && Object.keys(this.assetFees).length
    },
    request () {
      return {
        ...this.$route.query,
        args: JSON.parse(this.$route.query.args)
      }
    },
    feeInUsdValue () {
      if (!this.gas) {
        return
      }

      let feePerGas

      if (this.selectedFee === 'custom') {
        feePerGas = this.customFee
      } else {
        feePerGas = this.fees[this.activeNetwork]?.[this.activeWalletId]?.[this.assetChain]?.[this.selectedFee]?.fee
      }

      const txCost = this.gas.times(BN(feePerGas).div(1e9))

      return prettyFiatBalance(txCost, this.fiatRates[this.assetChain])
    }
  },
  async created () {
    await Promise.all([
      this.getSymbol(),
      this.getLabel(),
      this.updateFees({ asset: this.asset }),
      this.updateSendFees(0),
      this.updateMaxSendFees(),
      this.calculateGas()
    ])
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
