<template>
  <div class="details-wrapper">
    <NavBar :showBackButton="true" :backClick="goBack" :backLabel="$t('common.back')">
      <img :src="getAssetIcon(item.from)" class="asset-icon mr-2" />
      <span class="mr-2">{{ item.from }}</span>
      <img :src="typeIcon" />
    </NavBar>
    <div class="tx-details">
      <div class="tx-details_info">
        <div class="row" id="transaction_details_status">
          <div class="col-10">
            <h2>Status</h2>
            <p class="text-grey" id="transaction_details_status_and_confirmations">
              {{ status }}
              <span
                v-if="item.status === 'SUCCESS' && tx && tx.confirmations > 0"
                id="transaction_details_status_number_of_confirmations"
              >
                / {{ tx.confirmations }} {{ $t('pages.details.confirmations') }}
              </span>
            </p>
          </div>
          <div class="col-2">
            <CompletedIcon v-if="item.status === 'SUCCESS'" class="tx-details_status-icon" />
            <FailedIcon v-else-if="item.status === 'FAILED'" class="tx-details_status-icon" />
            <SpinnerIcon v-else class="tx-details_status-icon" />
          </div>
        </div>
        <div class="row" id="transaction_details_date_time">
          <div class="col">
            <h2>{{ $t('pages.details.time') }}</h2>
            <p>{{ prettyTime(item.endTime || item.startTime) }}</p>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <h2>{{ $t('pages.details.sent') }}</h2>
            <p id="transaction_detail_sent_amount" class="font-bold mb-1">
              {{ prettyBalance(item.amount, item.from) }} {{ item.from }}
            </p>
            <p id="transaction_detail_sent_amount_today">
              ${{
                prettyFiatBalance(prettyBalance(item.amount, item.from), fiatRates[item.from])
              }}
              / {{ $t('pages.details.today') }}
            </p>
            <p id="transaction_detail_sent_amount_then" v-if="item.fiatRate">
              ${{ prettyFiatBalance(prettyBalance(item.amount, item.from), item.fiatRate) }} / then
            </p>
          </div>
        </div>
        <hr />
        <div class="row" id="transaction_details_network_speed_fee">
          <div class="col">
            <h2>{{ $t('common.networkSpeedFee') }}</h2>
            <p class="d-flex justify-content-between">
              <span id="transaction_detail_network_speed"
                >{{ assetChain }} {{ $t('pages.details.speed') }}:
                <span class="text-capitalize">{{ item.feeLabel }}</span></span
              >
              <span id="transaction_detail_fee_units">Fee: {{ itemFee }} {{ feeUnit }}</span>
              <span>
                <a
                  class="speed-up"
                  v-if="canUpdateFee && !showFeeSelector && isCustomFeeSupported"
                  @click="openFeeSelector()"
                >
                  {{ $t('pages.details.speedUp') }}
                </a>
              </span>
            </p>
            <div v-if="showFeeSelector" class="mt-2">
              <FeeSelector
                :asset="item.from"
                :totalFees="sendFees"
                v-model="selectedFee"
                v-bind:fees="assetFees"
                v-bind:fiatRates="fiatRates"
              />
              <button
                class="btn btn-sm btn-primary btn-icon ml-2"
                :disabled="feeSelectorLoading"
                @click="updateFee()"
              >
                <SpinnerIcon class="btn-loading" v-if="feeSelectorLoading" />
                <template v-else>{{ $t('pages.details.update') }}</template>
              </button>
              <button
                class="btn btn-sm btn-outline-primary ml-2"
                v-if="!feeSelectorLoading"
                @click="closeFeeSelector()"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
        <hr />
        <div class="row">
          <div
            class="col tx-details_link d-flex align-items-start"
            id="transaction_details_transaction_id"
          >
            <h2 class="mr-4">{{ $t('pages.details.transactionId') }}</h2>
            <p>
              <a :href="transactionLink" target="_blank" id="transactionLink">{{
                shortenAddress(item.txHash)
              }}</a>
              <CopyIcon @click="copy(item.txHash)" />
            </p>
          </div>
        </div>
        <Timeline :id="id" :tx="tx" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import moment from '@liquality/wallet-core/dist/src/utils/moment'
import cryptoassets from '@liquality/wallet-core/dist/src/utils/cryptoassets'
import { getChain } from '@liquality/cryptoassets'
import BN from 'bignumber.js'
import { getSendTxFees, feePerUnit } from '@liquality/wallet-core/dist/src/utils/fees'
import {
  prettyBalance,
  prettyFiatBalance
} from '@liquality/wallet-core/dist/src/utils/coinFormatter'
import {
  getStatusLabel,
  ACTIVITY_FILTER_TYPES
} from '@liquality/wallet-core/dist/src/utils/history'
import { getItemIcon } from '@/utils/history'
import {
  getNativeAsset,
  getTransactionExplorerLink,
  getAddressExplorerLink
} from '@liquality/wallet-core/dist/src/utils/asset'
import { getAssetIcon } from '@/utils/asset'

import FeeSelector from '@/components/FeeSelector'
import CompletedIcon from '@/assets/icons/completed.svg'
import FailedIcon from '@/assets/icons/failed.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import CopyIcon from '@/assets/icons/copy.svg'
import NavBar from '@/components/NavBar.vue'
import { isObject } from 'lodash-es'
import { shortenAddress } from '@liquality/wallet-core/dist/src/utils/address'
import Timeline from '@/transactions/views/Timeline.vue'

export default {
  components: {
    FeeSelector,
    CompletedIcon,
    FailedIcon,
    SpinnerIcon,
    CopyIcon,
    NavBar,
    Timeline
  },
  data() {
    return {
      tx: null,
      showFeeSelector: false,
      feeSelectorLoading: false,
      selectedFee: 'average',
      sendFees: {}
    }
  },
  props: ['id'],
  computed: {
    ...mapGetters(['client', 'suggestedFeePrices']),
    ...mapState(['activeWalletId', 'activeNetwork', 'history', 'fees', 'fiatRates']),
    assetChain() {
      return getNativeAsset(this.item.from)
    },
    isCustomFeeSupported() {
      const { supportCustomFees } = getChain(this.activeNetwork, cryptoassets[this.item.from].chain)
      return supportCustomFees
    },
    itemFee() {
      const fee = feePerUnit(this.item.fee, this.chainId)
      return typeof this.item.fee !== 'object' ? fee : BN(fee).dp(3)
    },
    item() {
      return this.history[this.activeNetwork][this.activeWalletId].find(
        (item) => item.id === this.id
      )
    },
    status() {
      return getStatusLabel(this.item)
    },
    feeUnit() {
      return getChain(this.activeNetwork, cryptoassets[this.item.from].chain).fees.unit
    },
    chainId() {
      return cryptoassets[this.item.from].chain
    },
    addressLink() {
      return getAddressExplorerLink(this.item.toAddress, this.item.from, this.activeNetwork)
    },
    transactionLink() {
      return getTransactionExplorerLink(this.item.txHash, this.item.from, this.activeNetwork)
    },
    canUpdateFee() {
      return (
        this.feesAvailable && this.tx && (!this.tx.confirmations || this.tx.confirmations === 0)
      )
    },
    assetFees() {
      return this.suggestedFeePrices(this.assetChain)
    },
    feesAvailable() {
      return this.assetFees && Object.keys(this.assetFees).length
    },
    typeIcon() {
      const filter = ACTIVITY_FILTER_TYPES[this.item.type]
      return this.getItemIcon(filter?.icon)
    }
  },
  methods: {
    ...mapActions(['updateTransactionFee', 'updateFees']),
    getNativeAsset,
    prettyBalance,
    shortenAddress,
    getAssetIcon,
    prettyFiatBalance,
    getItemIcon,
    prettyTime(timestamp) {
      return moment(timestamp).format('MMM D YYYY, h:mm a')
    },
    async copy(text) {
      await navigator.clipboard.writeText(text)
    },
    openFeeSelector() {
      this.showFeeSelector = true
      this.updateFees({ asset: this.assetChain })
    },
    closeFeeSelector() {
      this.showFeeSelector = false
      this.selectedFee = 'average'
    },
    async _updateSendFees() {
      // TODO: This fee calculation is not correct in case of a swap and it could be based on already updated fee
      this.sendFees = await getSendTxFees(
        this.item.accountId,
        this.item.from,
        undefined,
        this.customFee
      )
    },
    async updateFee() {
      this.feeSelectorLoading = true
      const newFee = this.assetFees[this.selectedFee].fee
      const txKey = Object.keys(this.item).find(
        (key) => isObject(this.item[key]) && this.item[key].hash === this.item.txHash
      )
      const accountId = txKey === 'toClaimTx' ? this.item.toAccountId : this.item.fromAccountId

      try {
        this.tx = await this.updateTransactionFee({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          asset: this.item.from,
          id: this.item.id,
          hash: this.item.txHash,
          newFee,
          accountId
        })
      } finally {
        this.feeSelectorLoading = false
        this.closeFeeSelector()
      }
    },
    async updateTransaction() {
      const client = this.client({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        chainId: cryptoassets[this.item.from].chain,
        accountId: this.item.accountId
      })
      const transaction =
        (await client.chain.getTransactionByHash(this.item.txHash)) || this.item.tx
      this.tx = transaction
    },
    goBack() {
      this.$router.go(-1)
    }
  },
  created() {
    this.updateTransaction()
    this.interval = setInterval(() => this.updateTransaction(), 10000)
    this._updateSendFees()
  },
  beforeDestroy() {
    clearInterval(this.interval)
  }
}
</script>

<style lang="scss">
.details-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.speed-up {
  color: #9d4dfa;
}
.tx-details {
  padding: $wrapper-padding 0;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;

  &_link {
    p {
      display: flex;
      a {
        display: block;
        text-overflow: ellipsis;
      }
    }

    svg {
      flex: 0 0 14px;
      cursor: pointer;
      margin-left: 6px;
    }
  }

  .row {
    margin-bottom: 16px;

    p {
      margin-bottom: 0;
    }
  }

  h2 {
    font-size: $font-size-sm;
    font-weight: 600;
    text-transform: uppercase;
  }

  .row {
    padding: 0 $wrapper-padding;
  }

  &_status-icon {
    width: 28px;
    float: right;
  }
}
</style>
