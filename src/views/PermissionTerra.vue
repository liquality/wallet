<template>
  <div class="permission-send wrapper form text-center">
    <div class="wrapper_top form">
      <div v-if="error" class="mt-4 text-danger"><strong>Error:</strong> {{ error }}</div>

      <div class="wrapper_top form">
        <div class="form-group">
          <label>{{method}}</label>
          <p class="confirm-value" :style="getAssetColorStyle(asset)">{{asset}}</p>
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
          <!-- <div class="permission-send_data_code" v-if="showData">{{JSON.parse(JSON.stringify(data, undefined, 4))}}</div> -->
          <div class="permission-send_data_code" v-if="showData">
            <div class="msg-group" v-for="(item, index) in data" :key="index">
              <label class="msg-type">{{getMessageType(item.type)}}</label>
              <div class="msg-info-group" v-for="(info, _index) in Object.keys(item.value)" :key="_index">
                <label>{{info}}:</label>
                <label class="msg-info">{{item.value[info]}}</label>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="wrapper_bottom">
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
import { mapActions } from 'vuex'
import { getNativeAsset, getAssetColorStyle } from '@/utils/asset'

import { shortenAddress } from '@/utils/address'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import ChevronDown from '@/assets/icons/chevron_down.svg'
import ChevronRight from '@/assets/icons/chevron_right.svg'

const assets = {
  luna: 'Luna',
  uluna: 'Luna',
  uusd: 'UST',
  terra1ajt556dpzvjwl0kl5tzku3fc3p3knkg9mkv8jl: 'aUST',
  terra1u0t35drzyy0mujj8rkdyzhe264uls4ug3wdp3x: 'bLUNA',
  terra1747mad58h0w4y589y3sk84r5efqdev9q4r02pc: 'ANC'
}

const methods = {
  send: 'Send',
  transfer: 'Send',
  deposit_stable: 'Deposit',
  borrow_stable: 'Borrow Stable',
  repay_stable: 'Repay Stable',
  lock_collateral: 'Lock Collateral',
  withdraw_collateral: 'Withdraw Collateral',
  bond: 'Send',
  burn: 'Send',
  withdraw_unbonded: 'Withdraw',
  swap: 'Swap',
  withdraw_voting_tokens: 'Unstake',
  claim_rewards: 'Claim'
}

const message = {
  'wasm/MsgExecuteContract': 'Execute Contract',
  'bank/MsgSend': 'Transfer'
}

export default {
  components: {
    SpinnerIcon,
    ChevronDown,
    ChevronRight
  },
  data () {
    return {
      showData: false,
      selectedFee: 'average',
      error: null,
      loading: false,
      replied: false,
      customFee: null,
      gas: 0
    }
  },
  methods: {
    ...mapActions(['replyPermission']),
    getAssetColorStyle,
    toggleshowData () {
      this.showData = !this.showData
    },
    getMessageType (messageType) {
      return message[messageType]
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
    }
  },
  computed: {
    method () {
      return methods[this.request.args[0].method]
    },
    asset () {
      return assets[this.request.args[0].asset]
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
    data () {
      return this.request.args[0].data.msgs.map(msg => JSON.parse(msg))
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
      return this.request.args[0].fee.slice(0, 4)
    }
  },
  beforeDestroy () {
    // TODO: need to reply correctly when window is closed
    if (this.replied) return

    this.reply(false)
  }
}
</script>

<style lang="scss" scoped>
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
}
.permission-send {
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
      max-height: 300px;
      text-align: left;
      overflow-y: auto;
      word-wrap: break-word;
      font-size: $font-size-sm;
    }

    .msg-group {
      width: 385px;
      margin: 15px 0;
      padding: 15px 0;
      border-top: 1px solid $hr-border-color;
      border-bottom: 1px solid $hr-border-color;

      .msg-type {
        margin-bottom: 15px;
      }

      .msg-info-group {
        margin-bottom: 15px;
      }
    }
  }
}
</style>
