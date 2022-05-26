<template>
  <div>
    <div class="liquality-timeline">
      <small id="start_time">{{ prettyTime(item.startTime) }}</small>
      <h3>Start</h3>
      <div class="liquality-timeline_inner">
        <div class="liquality-timeline_container left completed">
          <div class="content" id="swap_details_content"></div>
        </div>
        <div
          class="liquality-timeline_container"
          v-for="(step, id) in timeline"
          :key="id"
          :class="{
            [step.side]: true,
            completed: step && step.completed,
            pending: step.pending
          }"
        >
          <div class="content">
            <template v-if="step.tx">
              <h3 :id="step.tx.asset">
                <a :href="step.tx.explorerLink" target="_blank" :id="step.title">{{
                  step.title
                }}</a>
                <CopyIcon @click="copy(step.tx.hash)" />
              </h3>
              <p class="text-muted" v-if="step.tx.fee && !feeSelectorEnabled(step)">
                Fee: {{ prettyBalance(step.tx.fee, step.tx.asset) }}
                {{ getNativeAsset(step.tx.asset) }}
              </p>
              <p
                id="confirmations_asset_number"
                class="text-muted"
                v-if="!feeSelectorEnabled(step)"
              >
                Confirmations: {{ step.tx.confirmations || 0 }}
              </p>
              <template v-if="canUpdateFee(step)">
                <div v-if="feeSelectorEnabled(step)" class="form fee-update">
                  <div class="input-group">
                    <input
                      type="number"
                      v-model="newFeePrice"
                      class="form-control form-control-sm"
                      autocomplete="off"
                    />
                    <div class="input-group-append">
                      <span class="input-group-text"
                        ><small>{{ feeSelectorUnit }}</small></span
                      >
                    </div>
                  </div>
                  <div
                    class="fee-update_fees d-flex justify-content-between"
                    v-if="feeSelectorFees"
                  >
                    <a class="align-left" @click="newFeePrice = feeSelectorFees.average.fee"
                      >Average: {{ feeSelectorFees.average.fee }}</a
                    >
                    <a
                      id="fastFee"
                      class="align-left"
                      @click="newFeePrice = feeSelectorFees.fast.fee"
                      >Fast: {{ feeSelectorFees.fast.fee }}</a
                    >
                  </div>
                  <div>
                    <button
                      class="btn btn-sm btn-outline-primary"
                      v-if="!feeSelectorLoading"
                      @click="closeFeeSelector()"
                    >
                      Cancel
                    </button>
                    <button
                      class="btn btn-sm btn-primary btn-icon"
                      :disabled="feeSelectorLoading"
                      @click="updateFee(step.tx.asset, step.tx.hash)"
                    >
                      <SpinnerIcon class="btn-loading" v-if="feeSelectorLoading" />
                      <template v-else>Update</template>
                    </button>
                  </div>
                </div>
                <a v-else @click="openFeeSelector(step)">Speed up</a>
              </template>
            </template>
            <h3 v-else>
              <span :class="{ 'text-muted': !step || !step.completed }">{{ step.title }}</span>
            </h3>
          </div>
        </div>
        <div
          class="liquality-timeline_container right"
          :class="{
            completed: !timeline[timeline.length - 1] || timeline[timeline.length - 1].completed
          }"
        >
          <div class="content"></div>
        </div>
      </div>
      <template>
        <h3
          :class="{
            'text-muted': !timeline[timeline.length - 1] || !timeline[timeline.length - 1].completed
          }"
        >
          Done
        </h3>
        <small v-if="!timeline[timeline.length - 1] || timeline[timeline.length - 1].completed"
          >Swap Status: {{ item.status.toLowerCase() }}</small
        >
        <br />
        <small v-if="!timeline[timeline.length - 1] || timeline[timeline.length - 1].completed">{{
          prettyTime(item.endTime)
        }}</small>
      </template>
    </div>
    <div class="text-center">
      <table class="retry-button-table table bg-white border-0 mb-0 mt-0">
        <tbody class="font-weight-normal" v-if="item.type === 'SWAP' && item.error">
          <tr>
            <td class="text-muted text-left small-12">Actions</td>
            <td class="text-danger">
              <button
                class="retry-button btn btn-sm btn-outline-primary"
                v-if="item.error"
                @click="$emit('retrySwap')"
              >
                Retry
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="advanced-button" @click="advanced = !advanced">
        <div class="advanced-arrow">
          <ChevronRightIcon v-if="!advanced" />
          <ChevronDownIcon v-else />
        </div>
        <div>ADVANCED</div>
      </div>
    </div>
    <div class="table" v-if="advanced">
      <table class="table bg-white border-0 mb-1 mt-1">
        <tbody class="font-weight-normal" v-if="item.type === 'SWAP'">
          <tr v-if="item.agent">
            <td class="text-muted text-left small-12">Counter-party</td>
            <td class="text-break">{{ item.agent }}</td>
          </tr>
          <tr v-if="item.orderId">
            <td class="text-muted text-left small-12">Order ID</td>
            <td id="swap_details_order_id" class="text-break">
              {{ item.orderId }}
              <CopyIcon class="copy-icon" @click="copy(item.orderId)" />
            </td>
          </tr>
          <tr>
            <td class="text-muted text-left small-12">Started At</td>
            <td id="swap_details_started_at" class="text-break">
              {{ new Date(item.startTime) }}
            </td>
          </tr>
          <tr>
            <td class="text-muted text-left small-12">Finished At</td>
            <td id="swap_details_finished_at" class="text-break">
              {{ item.endTime ? new Date(item.endTime) : '-' }}
            </td>
          </tr>
          <tr>
            <td class="text-muted text-left small-12">Rate</td>
            <td id="swap_details_rate">1 {{ item.to }} = {{ reverseRate }} {{ item.from }}</td>
          </tr>
          <tr>
            <td class="text-muted text-left small-12">Status</td>
            <td id="swap_details_status" class="text-break">{{ item.status }}</td>
          </tr>
          <tr>
            <td class="text-muted text-left small-12">Buy</td>
            <td id="swap_details_buy" class="text-break">
              {{ prettyBalance(item.toAmount, item.to) }} {{ item.to }}
            </td>
          </tr>
          <tr>
            <td class="text-muted text-left small-12">Sell</td>
            <td id="swap_details_sell" class="text-break">
              {{ prettyBalance(item.fromAmount, item.from) }} {{ item.from }}
            </td>
          </tr>
          <tr v-if="item.minConf">
            <td class="text-muted text-left small-12">Minimum confirmations</td>
            <td id="confirmations">{{ item.minConf }}</td>
          </tr>
          <tr v-if="item.fromAddress">
            <td class="text-muted text-left small-12">Your {{ item.from }} address</td>
            <td id="from_address" class="text-break">
              <a
                :href="addressLink(item.fromAddress, item.from, item.toAccountId)"
                target="_blank"
                id="transaction_details_send_to_link"
                >{{ shortenAddress(addPrefix(item.fromAddress, item.from)) }}</a
              >
              <CopyIcon class="copy-icon" @click="copy(addPrefix(item.fromAddress, item.from))" />
            </td>
          </tr>
          <tr v-if="item.toAddress">
            <td class="text-muted text-left small-12">Your {{ item.to }} address</td>
            <td id="to_address" class="text-break">
              <a
                :href="addressLink(item.toAddress, item.to, item.toAccountId)"
                target="_blank"
                id="transaction_details_send_to_link"
                >{{ shortenAddress(addPrefix(item.toAddress, item.to)) }}</a
              >
              <CopyIcon class="copy-icon" @click="copy(addPrefix(item.toAddress, item.to))" />
            </td>
          </tr>
          <tr v-if="item.secret">
            <td class="text-muted text-left small-12">Secret</td>
            <td id="secret_key">
              <span
                class="cursor-pointer text-muted font-weight-light text-break"
                v-if="secretHidden"
                @click="secretHidden = false"
              >
                Click to reveal the secret
              </span>
              <span v-else>
                {{ item.secret }}
              </span>
            </td>
          </tr>
          <tr v-if="item.secretHash">
            <td class="text-muted text-left small-12">Secret Hash</td>
            <td id="secretHash" class="text-break">{{ item.secretHash }}</td>
          </tr>
          <tr v-if="item.fromFundHash">
            <td class="text-muted text-left small-12">Your {{ item.from }} funding transaction</td>
            <td id="from_funding_transaction" class="text-break">
              {{ item.fromFundHash }}
            </td>
          </tr>
          <tr v-if="item.toFundHash">
            <td class="text-muted text-left small-12">
              Counter-party's {{ item.bridgeAsset || item.to }} funding transaction
            </td>
            <td id="to_funding_transaction" class="text-break">
              {{ item.toFundHash }}
            </td>
          </tr>
          <tr v-if="item.toClaimHash">
            <td class="text-muted text-left small-12">
              Your {{ item.bridgeAsset || item.to }} claim transaction
            </td>
            <td id="to_claim_hash" class="text-break">
              {{ item.toClaimHash }}
            </td>
          </tr>
          <tr v-if="item.bridgeAsset">
            <td class="text-muted text-left small-12">Bridge asset</td>
            <td id="bridge_asset">{{ item.bridgeAsset }}</td>
          </tr>
          <tr v-if="item.approveTxHash">
            <td class="text-muted text-left small-12">Your {{ item.from }} approve transaction</td>
            <td id="approve_transaction" class="text-break">{{ item.approveTxHash }}</td>
          </tr>
          <tr v-if="item.swapTxHash">
            <td class="text-muted text-left small-12">Swap Transaction</td>
            <td id="swap_transaction" class="text-break">
              {{ item.swapTxHash }}
            </td>
          </tr>
          <tr v-if="item.receiveTxHash">
            <td class="text-muted text-left small-12">Your {{ item.to }} receive transaction</td>
            <td id="receive_transaction" class="text-break">{{ item.receiveTxHash }}</td>
          </tr>
          <tr v-if="item.sendTx">
            <td class="text-muted text-left small-12">Your {{ item.to }} send transaction</td>
            <td id="send_transaction" class="text-break">{{ item.sendTx }}</td>
          </tr>
          <tr v-if="item.refundHash">
            <td class="text-muted text-left small-12">Your {{ item.from }} refund transaction</td>
            <td id="to_claim_hash" class="text-break">{{ item.refundHash }}</td>
          </tr>
          <tr v-if="false">
            <td class="text-muted text-left small-12">Actions</td>
            <td class="cursor-pointer text-danger" id="remove_this_item" @click="remove">
              Remove this item
            </td>
          </tr>
          <tr v-if="item.error">
            <td class="text-danger text-left small-12">Error</td>
            <td class="text-danger" id="item_error">
              <pre>{{ item.error.replace('Error: ', '') }}</pre>
            </td>
          </tr>
          <tr>
            <td class="text-muted text-left small-12">Actions</td>
            <td class="text-danger">
              <button
                class="retry-button btn btn-sm btn-outline-primary"
                v-if="item.error"
                @click="$emit('retrySwap')"
              >
                Retry
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import BN from 'bignumber.js'
import moment from '@liquality/wallet-core/dist/utils/moment'
import cryptoassets from '@liquality/wallet-core/dist/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'

import { prettyBalance } from '@liquality/wallet-core/dist/utils/coinFormatter'
import { getSwapTimeline, ACTIONS_TERMS } from '@liquality/wallet-core/dist/utils/timeline'
import {
  isEthereumChain,
  getNativeAsset,
  getAddressExplorerLink
} from '@liquality/wallet-core/dist/utils/asset'

import SpinnerIcon from '@/assets/icons/spinner.svg'
import CopyIcon from '@/assets/icons/copy.svg'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import ChevronRightIcon from '@/assets/icons/chevron_right.svg'
import { getSwapProviderConfig } from '@liquality/wallet-core/dist/swaps/utils'
import { getSwapProvider } from '@liquality/wallet-core/dist/factory'
import { calculateQuoteRate } from '@liquality/wallet-core/dist/utils/quotes'
import { shortenAddress } from '@liquality/wallet-core/dist/utils/address'

export default {
  components: {
    SpinnerIcon,
    CopyIcon,
    ChevronDownIcon,
    ChevronRightIcon
  },
  data() {
    return {
      advanced: false,
      secretHidden: true,
      timeline: [],
      showFeeSelector: false,
      feeSelectorLoading: false,
      feeSelectorAsset: null,
      newFeePrice: null
    }
  },
  props: ['id', 'retrySwap'],
  computed: {
    ...mapGetters(['client', 'accountItem']),
    ...mapState(['activeWalletId', 'activeNetwork', 'balances', 'history', 'fees']),
    item() {
      return this.history[this.activeNetwork][this.activeWalletId].find(
        (item) => item.id === this.id
      )
    },
    reverseRate() {
      return BN(1).div(calculateQuoteRate(this.item)).dp(8)
    },
    orderLink() {
      if (this.item.provider !== 'liquality') {
        return ''
      }
      const agent = getSwapProviderConfig(this.item.network, this.item.provider).agent
      return agent + '/api/swap/order/' + this.item.id + '?verbose=true'
    },
    feeSelectorFees() {
      return this.fees[this.activeNetwork]?.[this.activeWalletId]?.[
        getNativeAsset(this.feeSelectorAsset)
      ]
    },
    feeSelectorUnit() {
      const chain = cryptoassets[this.feeSelectorAsset].chain
      return chains[chain].fees.unit
    },
    timelineDiagramSteps() {
      const swapProvider = getSwapProvider(this.item.network, this.item.provider)
      return swapProvider.timelineDiagramSteps
    }
  },
  methods: {
    ...mapActions(['updateTransactionFee', 'updateFees', 'checkPendingActions']),
    getNativeAsset,
    prettyBalance,
    shortenAddress,
    isEthereumChain,
    // get to asset when liquality boost provider is swapping from Native to ERC20
    prettyTime(timestamp) {
      return moment(timestamp).format('L, LT')
    },
    async copy(text) {
      await navigator.clipboard.writeText(text)
    },
    canUpdateFee(step) {
      return (
        (step.side === 'left' || step.title.indexOf(ACTIONS_TERMS.swap.pending) !== -1) &&
        (!step.tx.confirmations || step.tx.confirmations === 0)
      )
    },
    feeSelectorEnabled(step) {
      return (
        this.canUpdateFee(step) && this.feeSelectorAsset === step.tx.asset && this.showFeeSelector
      )
    },
    openFeeSelector(step) {
      this.showFeeSelector = true
      this.newFeePrice = step.tx.feePrice
      this.feeSelectorAsset = step.tx.asset
      this.updateFees({ asset: getNativeAsset(step.tx.asset) })
    },
    closeFeeSelector() {
      this.showFeeSelector = false
      this.newFeePrice = null
    },
    async updateTransactions() {
      const timeline = await getSwapTimeline(this.item, ({ network, walletId, asset }) =>
        this.client({ network, walletId, asset })
      )

      this.timeline = timeline
    },
    async updateFee(asset, hash) {
      this.feeSelectorLoading = true
      try {
        await this.updateTransactionFee({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          asset,
          id: this.item.id,
          hash,
          newFee: this.newFeePrice
        })
        // TODO decide if this is a safe option or change approach
        // await this.checkPendingActions({ walletId: this.activeWalletId })
      } finally {
        this.updateTransactions()
        this.feeSelectorLoading = false
        this.showFeeSelector = false
      }
    },
    addressLink(address, asset, accountId) {
      if (accountId) {
        return getAddressExplorerLink(address, asset, this.activeNetwork)
      }

      return '#'
    },
    addPrefix(address, asset) {
      return !address.startsWith('0x') && isEthereumChain(asset) ? '0x' + address : address
    }
  },
  created() {
    this.updateTransactions()
    this.interval = setInterval(() => {
      this.updateTransactions()
    }, 5000)
  },
  beforeDestroy() {
    clearInterval(this.interval)
  }
}
</script>

<style lang="scss">
.liquality-timeline {
  padding-bottom: 20px;
  text-align: center;

  &_inner {
    position: relative;
    width: 100%;
    margin: 8px 0;

    &::after {
      content: '';
      position: absolute;
      width: 0px;
      border-right: 1px dashed $color-secondary;
      top: 0;
      bottom: 0;
      left: 50%;
    }
  }

  h3 {
    margin: 2px 0;
    font-size: $font-size-base;
  }

  .align-left {
    text-align: left !important;
  }
  /* Container around content */
  &_container {
    min-height: 50px;
    position: relative;
    width: 50%;

    &::after {
      content: '';
      position: absolute;
      width: 11px;
      height: 11px;
      border: 1px solid $color-secondary;
      background: white;
      top: 0;
      border-radius: 50%;
      z-index: 1;
    }

    &.completed::after,
    &.pending::after {
      background-color: $color-secondary;
      border: 1px solid $hr-border-color;
    }

    &.completed:first-child::after,
    &.completed:last-child::after {
      background-color: $color-secondary;
      border: 0;
    }

    &:last-child {
      height: 0;
      min-height: 10px;
    }

    .content {
      position: relative;
      top: -3px;

      h3 svg {
        cursor: pointer;
        width: 14px;
        margin-left: 6px;
      }

      p {
        font-size: $font-size-sm;
        margin: 0;
      }
    }
  }

  /* Place the container to the left */
  .left {
    left: 0;
    padding-right: 14px;

    .content {
      text-align: right;
    }
  }

  /* Place the container to the right */
  .right {
    left: 50%;
    padding-left: 14px;

    .content {
      text-align: left;
    }
  }

  /* Fix the circle for containers on the right side */
  .right::after {
    left: -5px;
  }

  .left::after {
    right: -6px;
  }
}

.border-0 {
  box-shadow: none !important;

  tr {
    border-top: 1px solid #d9dfe5;
    padding: 15px 20px !important;
    display: flex;
    flex-direction: column;
  }

  td {
    border: none !important;
    padding: 3px 0px 0px 0px !important;
    text-align: left;
    width: 305px;
    word-wrap: break-word;

    .copy-icon {
      width: 14px;
      height: 14px;
      cursor: pointer;
      margin: 0px 0px 0px 6px;
    }

    pre {
      margin: 0px;
    }
  }

  #secret_key {
    .cursor-pointer {
      color: #9d4dfa !important;
    }
  }
}

.retry-button {
  background-color: #9d4dfa !important;
  border: none !important;
  color: white !important;
  text-align: center !important;
  text-decoration: none !important;
  display: inline-block !important;
  font-size: 12px !important;
  padding: 0px !important;

  height: 19px;
  width: 90px;
}

.advanced-button {
  padding: 19px 20px;
  font-weight: bold;
  font-size: 12px;
  display: flex;
  gap: 6.5px;
  border-top: 1px solid #d9dfe5;

  .advanced-arrow {
    display: flex;
    align-items: center;

    svg {
      height: 10px !important;
      width: 10px !important;
    }
  }
}

.fee-update {
  padding-left: 10px;

  .btn-primary {
    margin-left: 10px;
    min-width: 60px;
  }

  &_fees {
    font-size: $font-size-tiny;
    margin: 6px 0;
  }
}

#fastFee {
  padding-left: 0.6em;
}
</style>
