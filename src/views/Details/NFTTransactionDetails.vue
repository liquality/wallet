<template>
  <div class="details-wrapper">
    <NavBar :showBackButton="true" :backClick="goBack" :backLabel="$t('common.back')">
      <span class="mr-2">{{ $t('pages.details.sentNFT') }}</span>
    </NavBar>
    <div class="tx-details">
      <div class="tx-details_info">
        <div class="row" id="transaction_details_status">
          <div class="col-10">
            <h2>{{ $t('pages.details.status') }}</h2>
            <p class="text-grey" id="transaction_details_status_and_confirmations">
              {{ status }}
              <span
                id="transaction_details_status_number_of_confirmations"
                v-if="item.status === 'SUCCESS' && tx && tx?.confirmations > 0"
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
            <h2>Time</h2>
            <div class="d-flex justify-content-between">
              <p v-if="item.startTime" class="mr-2">
                {{ $t('pages.details.initiated') }} {{ prettyTime(item.startTime) }}
              </p>
              <p v-if="item.endTime">
                {{ $t('pages.details.completed') }} {{ prettyTime(item.endTime) }}
              </p>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <h2>{{ $t('pages.details.sentAsset') }}</h2>
            <div class="d-flex">
              <div class="nft-image mr-2" style="--img-width: 100px">
                <img
                  ref="nftThumbnailImage"
                  :src="item.nft.image_thumbnail_url || thumbnailImage"
                  :alt="item.nft.name || 'NFT Image'"
                  @error="imageError('nftThumbnailImage')"
                />
              </div>
              <div class="w-100">
                <p class="font-bold text-break">{{ item.nft.name }}</p>
                <p class="text-break">{{ item.nft.collection.name }}</p>
                <p class="text-break" v-if="item.nft.token_id">#{{ item.nft.token_id }}</p>
              </div>
            </div>
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
            </p>
            <p class="d-flex justify-content-between">
              <span id="transaction_detail_fee_units">
                {{ $t('pages.details.fee') }}: {{ itemFee }} {{ feeUnit }}
              </span>
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
                :asset="asset"
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
            id="transaction_details_transaction"
          >
            <h2 class="mr-4">{{ $t('pages.details.transaction') }}</h2>
          </div>
        </div>
        <Timeline :id="id" :tx="tx" :asset="asset" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import moment from '@liquality/wallet-core/dist/src/utils/moment'
import cryptoassets from '@liquality/wallet-core/dist/src/utils/cryptoassets'
import { getChain, getNativeAssetCode } from '@liquality/cryptoassets'
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
import {
  getNativeAsset,
  getTransactionExplorerLink,
  getAddressExplorerLink
} from '@liquality/wallet-core/dist/src/utils/asset'
import { getAssetIcon } from '@/utils/asset'
import { getItemIcon } from '@/utils/history'

import FeeSelector from '@/components/FeeSelector'
import Timeline from '@/components/NFT/NFTTimeline.vue'
import CompletedIcon from '@/assets/icons/completed.svg'
import FailedIcon from '@/assets/icons/failed.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import NavBar from '@/components/NavBar.vue'
import { shortenAddress } from '@liquality/wallet-core/dist/src/utils/address'
import NFTThumbnailImage from '@/assets/nft_thumbnail.png'

export default {
  components: {
    FeeSelector,
    Timeline,
    CompletedIcon,
    FailedIcon,
    SpinnerIcon,
    NavBar
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
    ...mapGetters(['client', 'accountItem', 'suggestedFeePrices']),
    ...mapState(['activeWalletId', 'activeNetwork', 'history', 'fees', 'fiatRates']),
    isCustomFeeSupported() {
      const { supportCustomFees } = getChain(
        this.activeNetwork,
        cryptoassets[this.item.from]?.chain
      )
      return supportCustomFees
    },
    thumbnailImage() {
      return NFTThumbnailImage
    },
    assetChain() {
      return getNativeAsset(this.asset)
    },
    itemFee() {
      const fee = feePerUnit(this.item.fee, cryptoassets[this.asset].chain)
      return typeof this.item.fee !== 'object' ? fee : BN(fee).dp(3)
    },
    item() {
      return this.history[this.activeNetwork][this.activeWalletId].find(
        (item) => item.id === this.id
      )
    },
    accountId() {
      return this.item.nft.accountId || this.item.accountId
    },
    account() {
      return this.accountItem(this.accountId)
    },
    chain() {
      return this.account?.chain
    },
    status() {
      return getStatusLabel(this.item)
    },
    feeUnit() {
      return getChain(this.activeNetwork, cryptoassets[this.asset].chain).fees.unit
    },
    asset() {
      return getNativeAssetCode(this.activeNetwork, this.chain)
    },
    chainId() {
      return cryptoassets[this.asset].chain
    },
    addressLink() {
      return getAddressExplorerLink(this.item.toAddress, this.asset, this.activeNetwork)
    },
    transactionLink() {
      return getTransactionExplorerLink(this.item.txHash, this.asset, this.activeNetwork)
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
    async _updateSendFees() {
      // TODO: This fee calculation for sending NFTs is inccorect. It uses 21k gas limit of sending native asset.
      // It might be based on updated fee.
      this.sendFees = await getSendTxFees(this.accountId, this.asset, undefined, this.customFee)
    },
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
    async updateFee() {
      this.feeSelectorLoading = true
      const newFee = this.assetFees[this.selectedFee].fee

      const accountId = this.accountId

      try {
        this.tx = await this.updateTransactionFee({
          network: this.activeNetwork,
          walletId: this.activeWalletId,
          asset: this.asset,
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
        chainId: cryptoassets[this.asset].chain,
        accountId: this.item.accountId
      })
      const transaction =
        (await client.chain.getTransactionByHash(this.item.txHash)) || this.item.tx
      this.tx = transaction
    },
    goBack() {
      this.$router.go(-1)
    },
    imageError(ref) {
      if (ref) {
        this.$refs[ref].src = this.thumbnailImage
      }
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

  .nft-image {
    min-width: var(--img-width);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

#transaction_details_date_time {
  p {
    font-size: 10px;
    line-height: 12px;
    color: #646f85;
  }
}
</style>
