<template>
  <div class="account-container">
    <template v-if="activeView === 'selectAsset'">
      <NavBar :showBack="true" :backPath="routeSource" :backLabel="$t('common.overview')">
        <span class="account-title">{{ title }}</span>
      </NavBar>
      <div class="account-content mx-3">
        <div>
          <Accordion v-for="(assets, key) in nftCollection" :key="assets.id">
            <h3 slot="header" id="nft-asset-header">
              {{ nftCollectionName(assets, key) }} ({{ assets.length }})
            </h3>
            <div class="nft-assets__container__images">
              <div
                class="nft-image"
                style="--img-width: 100px"
                v-for="asset in assets"
                :key="asset.id"
                @click="selectNFT(asset)"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="11"
                    height="11"
                    rx="5.5"
                    :fill="
                      selectedNFT && selectedNFT.token_id === asset.token_id ? '#2CD2CF' : '#FFFFFF'
                    "
                    stroke="#646F85"
                  />
                </svg>
                <img
                  ref="asset"
                  :src="asset.image_thumbnail_url || thumbnailImage"
                  :alt="asset.name || 'NFT asset'"
                  @error="imageError('asset')"
                />
              </div>
            </div>
          </Accordion>
        </div>
      </div>
      <div class="button-group mx-3">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="$router.push(routeSource)">
          {{ $t('common.cancel') }}
        </button>
        <button
          class="btn btn-primary btn-lg btn-icon"
          @click="next('selectedAsset')"
          :disabled="!selectedNFT"
        >
          {{ $t('common.next') }}
        </button>
      </div>
    </template>
    <template v-else-if="activeView === 'selectedAsset'">
      <NavBar :showBackButton="true" :backClick="back" :backLabel="$t('common.back')">
        <span class="account-title">{{ title }}</span>
      </NavBar>
      <div class="selected-nft-asset mx-3 mt-4 h-100">
        <div class="d-flex flex-column justify-content-between h-100">
          <div class="mb-3">
            <h3 class="text-uppercase">{{ $t('common.selectedAsset') }}</h3>
            <div class="selected-nft-asset__image">
              <div class="nft-image mr-2" style="--img-width: 110px">
                <img
                  ref="nftThumbnailImage"
                  :src="selectedNFT.image_thumbnail_url || thumbnailImage"
                  alt="selected nft"
                  @error="imageError('nftThumbnailImage')"
                />
              </div>
              <div>
                <h3>{{ selectedNFT.name }}</h3>
                <p>{{ selectedNFT.collection.name }}</p>
              </div>
            </div>
            <div class="selected-nft-asset__send-details">
              <h3 class="text-uppercase">{{ $t('pages.send.sendFrom') }}</h3>
              <div class="d-flex">
                <img :src="getAssetIcon(asset)" class="asset-icon mr-3" />
                <div>
                  <div class="d-flex align-items-center">
                    <span class="font-bold mr-1">{{ asset }}</span>
                    <div class="mr-3">
                      <span class="mr-1">{{ shortenAddress(fromAddress) }}</span>
                      <span><CopyIcon class="copy-icon" @click="copy(fromAddress)" /></span>
                    </div>
                  </div>
                  <div class="text-muted">
                    {{ $t('common.available') }} {{ balance }} {{ asset }}
                  </div>
                </div>
              </div>
              <div class="form-group mt-4">
                <label for="address">
                  <h3 class="text-uppercase">{{ $t('pages.send.sendTo') }}</h3>
                </label>
                <div class="input-group">
                  <input
                    type="text"
                    :class="{ 'is-invalid': address && addressError }"
                    v-model="address"
                    class="form-control form-control-sm"
                    id="address"
                    :placeholder="$t('common.address')"
                    autocomplete="off"
                    required
                  />
                </div>
                <small
                  v-if="address && addressError"
                  class="text-danger form-text text-right"
                  id="address_format_error"
                  >{{ addressError }}</small
                >
              </div>
            </div>
          </div>
          <DetailsContainer v-if="feesAvailable && isCustomFeeSupported">
            <template v-slot:header>
              <div class="network-header-container">
                <span class="details-title" id="send_network_speed">
                  {{ $t('common.networkSpeedFee') }}
                </span>
                <span class="text-muted" id="send_network_speed_avg_fee">
                  ({{ selectedFeeLabel }} / {{ prettyFee }} {{ assetChain }})
                </span>
              </div>
              <SpinnerIcon class="updating-fees" v-show="updatingFees" />
            </template>
            <template v-slot:content>
              <ul class="selectors">
                <li>
                  <div class="send_fees">
                    <span class="selectors-asset">{{ assetChain }}</span>
                    <div class="custom-fees" v-if="customFee">
                      <span v-if="prettyFee.eq(0)"
                        >{{ currentChainAssetFee }} {{ currentChainUnit }}</span
                      >
                      <span v-else>{{ prettyFee }} {{ assetChain }}</span> /
                      {{ totalFeeInFiat }} USD
                      <button class="btn btn-link" @click="resetCustomFee">
                        {{ $t('common.reset') }}
                      </button>
                    </div>
                    <FeeSelector
                      v-else
                      :asset="asset"
                      v-model="selectedFee"
                      :fees="assetFees"
                      :totalFees="sendFees"
                      :fiatRates="fiatRates"
                      @custom-selected="onCustomFeeSelected"
                    />
                  </div>
                </li>
              </ul>
            </template>
          </DetailsContainer>
          <template v-if="!isCustomFeeSupported">
            <div class="network-header-container">
              <span class="details-title" id="send_network_speed"
                ><strong> {{ $t('common.networkSpeedFee') }}</strong></span
              >
              <span v-show="!updatingFees" class="text-muted" id="send_network_speed_avg_fee">
                ({{ prettyFee }} {{ assetChain }})
              </span>
            </div>
            <SpinnerIcon class="updating-fees" v-show="updatingFees" />
          </template>
          <div class="button-group">
            <button class="btn btn-light btn-outline-primary btn-lg" @click="back()">
              {{ $t('common.cancel') }}
            </button>
            <button
              class="btn btn-primary btn-lg btn-icon"
              @click="next('review')"
              :disabled="!canSend || updatingFees"
            >
              {{ $t('common.review') }}
            </button>
          </div>
        </div>
      </div>
    </template>
    <template class="send" v-else-if="activeView === 'custom-fees' && !isEIP1559Fees">
      <NavBar
        :showBackButton="true"
        :backClick="(activeView = 'selectedAsset')"
        :backLabel="$t('common.back')"
      >
        <span class="account-title">{{ title }}</span>
      </NavBar>
      <CustomFees
        @apply="applyCustomFee"
        @update="setCustomFee"
        @cancel="cancelCustomFee"
        :asset="assetChain"
        :selected-fee="selectedFee"
        :fees="assetFees"
        :totalFees="sendFees"
        :fiatRates="fiatRates"
      />
    </template>
    <template class="send" v-else-if="activeView === 'custom-fees' && isEIP1559Fees">
      <NavBar :showBackButton="true" :backClick="cancelCustomFee" :backLabel="$t('common.back')">
        <span class="account-title">{{ title }}</span>
      </NavBar>
      <CustomFeesEIP1559
        @apply="applyCustomFee"
        @update="setCustomFee"
        @cancel="cancelCustomFee"
        :asset="assetChain"
        :selected-fee="selectedFee"
        :fees="assetFees"
        :totalFees="sendFees"
        :fiatRates="fiatRates"
        :padLabels="true"
      />
    </template>
    <template v-else-if="activeView === 'review'">
      <NavBar :showBackButton="true" :backClick="back" :backLabel="$t('common.back')">
        <span class="account-title">{{ title }}</span>
      </NavBar>
      <div class="selected-nft-asset mx-3 mt-4 h-100">
        <div class="d-flex flex-column justify-content-between h-100">
          <div>
            <h3 class="text-uppercase">{{ $t('common.selectedAsset') }}</h3>
            <div class="selected-nft-asset__image">
              <div class="nft-image mr-2" style="--img-width: 110px">
                <img
                  ref="selectedNFT"
                  :src="selectedNFT.image_thumbnail_url || thumbnailImage"
                  alt="selected-nft"
                  @error="imageError('selectedNFT')"
                />
              </div>
              <div>
                <h3>{{ selectedNFT.name }}</h3>
                <p>{{ selectedNFT.collection.name }}</p>
              </div>
            </div>
            <div class="selected-nft-asset__send-details">
              <h3 class="text-uppercase">{{ $t('common.networkSpeedFee') }}</h3>
              <div class="d-flex justify-content-between">
                <p>{{ prettyFee }} {{ asset }}</p>
                <p>{{ totalFeeInFiat }} USD</p>
              </div>
              <div class="form-group mt-4">
                <h3 for="address" class="text-uppercase text-muted">
                  {{ $t('pages.send.sendTo') }}
                </h3>
                <p class="address">
                  <span class="font-bold">{{ startAddress }}</span
                  >{{ middleAddressPart }}<span class="font-bold">{{ endAddress }}</span>
                </p>
              </div>
            </div>
          </div>
          <div class="button-group">
            <button class="btn btn-light btn-outline-primary btn-lg" @click="next('selectedAsset')">
              {{ $t('common.edit') }}
            </button>
            <button class="btn btn-primary btn-lg btn-icon" @click="sendNFT" :disabled="loading">
              <SpinnerIcon class="btn-loading" v-if="loading" />
              <template v-else>{{ $t('common.sendNFT') }}</template>
            </button>
          </div>
        </div>
      </div>
    </template>
    <OperationErrorModal
      :open="sendErrorModalOpen"
      :account="account"
      @close="closeSendErrorModal"
      :liqualityErrorString="sendErrorMessage"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import NavBar from '@/components/NavBar.vue'
import Accordion from '@/components/Accordion.vue'
import { getChain, getNativeAssetCode } from '@liquality/cryptoassets'
import { shortenAddress } from '@liquality/wallet-core/dist/src/utils/address'
import cryptoassets from '@liquality/wallet-core/dist/src/utils/cryptoassets'
import CopyIcon from '@/assets/icons/copy.svg'
import {
  estimateTransferNFT,
  getFeeLabel,
  feePerUnit
} from '@liquality/wallet-core/dist/src/utils/fees'
import { getFeeAsset, getNativeAsset } from '@liquality/wallet-core/dist/src/utils/asset'
import { getAssetIcon } from '@/utils/asset'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import OperationErrorModal from '@/components/OperationErrorModal'
import FeeSelector from '@/components/FeeSelector'
import CustomFees from '@/components/CustomFees'
import CustomFeesEIP1559 from '@/components/CustomFeesEIP1559'
import DetailsContainer from '@/components/DetailsContainer'
import {
  formatFiat,
  formatFiatUI,
  prettyBalance,
  prettyFiatBalance
} from '@liquality/wallet-core/dist/src/utils/coinFormatter'
import _ from 'lodash'
import BN from 'bignumber.js'
import NFTThumbnailImage from '@/assets/nft_thumbnail.png'
import { errorToLiqualityErrorString } from '@liquality/error-parser/dist/src/utils'
import { reportLiqualityError } from '@liquality/error-parser/dist/src/reporters/index'

export default {
  components: {
    NavBar,
    Accordion,
    CopyIcon,
    SpinnerIcon,
    FeeSelector,
    CustomFees,
    CustomFeesEIP1559,
    DetailsContainer,
    OperationErrorModal
  },
  data() {
    return {
      sendFees: {},
      eip1559fees: {},
      amount: 0.0,
      activeView: 'selectAsset',
      selectedNFT: null,
      loading: false,
      sendErrorModalOpen: false,
      customFeeAssetSelected: null,
      customFee: null,
      sendErrorMessage: '',
      address: '',
      selectedFee: 'average',
      updatingFees: false
    }
  },
  watch: {
    activeView(newVal) {
      if (newVal === 'selectedAsset' && this.selectedNFT && !this.updatingFees) {
        this.requestUpdateFees()
      }
    }
  },
  async created() {
    if (this.$route.query.nftAsset) {
      this.activeView = 'selectedAsset'
      const collectionName = this.$route.query.collection
      const nftAssetId = this.$route.query.nftAsset
      const collections = this.accountNftCollections(this.accountId)
      if (collections && collections[collectionName]) {
        this.selectedNFT = collections[collectionName].find((i) => i.token_id == nftAssetId)
        this.requestUpdateFees()
      }
    }
    await this.trackAnalytics({
      event: 'Send NFT screen',
      properties: {
        category: 'Send',
        action: 'User on Send NFT screen',
        label: `NFT`
      }
    })
  },
  computed: {
    ...mapGetters([
      'activity',
      'accountItem',
      'accountsData',
      'accountNftCollections',
      'suggestedFeePrices'
    ]),
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'history',
      'externalConnections',
      'fees',
      'fiatRates'
    ]),
    title() {
      switch (this.activeView) {
        case 'selectAsset':
          return this.$t('pages.send.titleSelectNFT')
        case 'selectedAsset':
          return this.$t('pages.send.titleSendNFT')
        case 'custom-fees':
          return this.$t('common.customFees')
        case 'review':
          return this.$t('pages.send.titleReviewSendNFT')

        default:
          return ''
      }
    },
    thumbnailImage() {
      return NFTThumbnailImage
    },
    nftCollection() {
      const collection = this.accountNftCollections(this.account?.id)
      const sortedCollection = Object.keys(collection)
        .sort()
        .reduce((collectionList, collectionName) => {
          collectionList[collectionName] = collection[collectionName]

          return collectionList
        }, {})
      return sortedCollection
    },
    routeSource() {
      if (this.$route.query?.source) {
        return `${this.$route.query.source}`
      }
      return '/wallet/nfts'
    },
    totalFeeInFiat() {
      return prettyFiatBalance(this.currentFee, this.fiatRates[this.assetChain])
    },
    accountId() {
      if (this.$route.query.accountId) {
        return this.$route.query.accountId
      }
      return this.selectedNFT.accountId
    },
    account() {
      return this.accountItem(this.accountId)
    },
    assetHistory() {
      return this.activity.filter((item) => item.from === this.asset)
    },
    balance() {
      // The balance is always the native asset balance
      const balance = this.account?.balances?.[this.asset] || 0
      return prettyBalance(balance, this.asset)
    },
    canSend() {
      if (!this.address || !this.isValidAddress) return false
      if (BN(this.balance).lte(0)) return false

      return true
    },
    fromAddress() {
      return getChain(this.activeNetwork, this.account?.chain)?.formatAddressUI(
        this.account?.addresses[0]
      )
    },
    isValidAddress() {
      return getChain(this.activeNetwork, cryptoassets[this.asset].chain).isValidAddress(
        this.address
      )
    },
    addressError() {
      if (!this.isValidAddress) {
        return this.$t('common.addressFormatError')
      }
      return null
    },
    selectedFeeLabel() {
      return getFeeLabel(this.selectedFee)
    },
    currentFee() {
      const fees = this.sendFees
      return this.selectedFee in fees ? fees[this.selectedFee] : BN(0)
    },
    prettyFee() {
      return this.currentFee.dp(6)
    },
    assetChain() {
      // in NFT screen the asset chain is always the asset
      return getNativeAsset(this.asset)
    },
    assetFees() {
      const assetFees = {}
      if (this.customFee) {
        assetFees.custom = { fee: this.customFee }
      }

      const fees = this.suggestedFeePrices(this.assetChain)
      if (fees) {
        Object.assign(assetFees, fees)
      }
      return assetFees
    },
    feesAvailable() {
      return this.assetFees && Object.keys(this.assetFees).length
    },
    isEIP1559Fees() {
      return cryptoassets[this.asset].chain === this.account?.chain
    },
    asset() {
      return this.account ? getNativeAssetCode(this.activeNetwork, this.account?.chain) : null
    },
    startAddress() {
      return this.address.slice(0, 6)
    },
    middleAddressPart() {
      return this.address.substring(6, this.address.length - 4)
    },
    endAddress() {
      return this.address.slice(this.address.length - 4)
    },
    isCustomFeeSupported() {
      const { supportCustomFees } = getChain(this.activeNetwork, cryptoassets[this.asset].chain)
      return supportCustomFees
    }
  },
  methods: {
    ...mapActions('app', ['trackAnalytics']),
    ...mapActions(['sendNFTTransaction', 'updateFees', 'updateNFTs']),
    getAssetIcon,
    shortenAddress,
    formatFiat,
    formatFiatUI,
    prettyBalance,
    getFeeAsset,
    getFeeLabel,
    getNativeAsset,
    async copy(text) {
      await navigator.clipboard.writeText(text)
    },
    selectNFT(asset) {
      this.selectedNFT = asset
    },
    closeSendErrorModal() {
      this.sendErrorModalOpen = false
      this.loading = false
    },
    back() {
      switch (this.activeView) {
        case 'selectedAsset':
          if (this.$route.query.nftAsset) {
            return this.$router.push(this.routeSource)
          }
          return (this.activeView = 'selectAsset')

        case 'review':
          return (this.activeView = 'selectedAsset')

        default:
          return
      }
    },
    next(view) {
      this.activeView = view
    },
    setActiveView(view) {
      if (this.activeView === 'selectAsset') {
        return '/wallet/nfts'
      }
      this.activeView = view
    },
    nftCollectionName(assets, key) {
      if (key && key !== 'undefined' && key !== 'null') {
        return key
      } else {
        return assets.filter((asset) => asset.name)[0]?.name || 'Unknown Collection'
      }
    },
    cancelCustomFee() {
      this.activeView = 'selectedAsset'
      this.selectedFee = 'average'
    },
    setCustomFee: _.debounce(async function ({ fee }) {
      this.customFee = fee
      this.updateSendFees(this.amount)
    }, 800),
    applyCustomFee({ fee }) {
      const presetFee = Object.entries(this.assetFees).find(
        ([speed, speedFee]) =>
          speed !== 'custom' &&
          (speedFee.fee === fee ||
            (fee.maxPriorityFeePerGas &&
              speedFee.fee.maxPriorityFeePerGas === fee.maxPriorityFeePerGas &&
              speedFee.fee.maxFeePerGas === fee.maxFeePerGas))
      )

      if (presetFee) {
        const [speed] = presetFee
        this.selectedFee = speed
        this.customFee = null
      } else {
        this.updateSendFees(this.amount)
        this.customFee = feePerUnit(fee, cryptoassets[this.asset].chain)
        this.selectedFee = 'custom'
      }
      this.activeView = 'selectedAsset'
    },
    onCustomFeeSelected() {
      this.activeView = 'custom-fees'
    },
    resetCustomFee() {
      this.customFee = null
      this.selectedFee = 'average'
    },
    async _updateSendFees(amount = 1) {
      if (!this.selectedNFT) return
      const sendFees = await estimateTransferNFT(
        this.account.id,
        this.activeNetwork,
        this.address,
        [amount],
        this.selectedNFT,
        this.customFee
      )
      this.sendFees = sendFees
    },
    updateSendFees: _.debounce(async function (amount) {
      // In NFT screen the balance is equal to the native asset balance
      console.log(
        `on updateSendFees => amount: ${amount}, balance: ${this.balance}, asset: ${this.asset}, `
      )
      if (BN(this.balance).gt(0)) {
        console.log('Updating fees')
        await this._updateSendFees()
      } else {
        console.log('balance <= 0, not updating fees')
      }
    }, 800),
    async refreshNFTs() {
      const accountIds = this.accountsData.map((account) => {
        return account.id
      })
      try {
        await this.updateNFTs({
          walletId: this.activeWalletId,
          network: this.activeNetwork,
          accountIds: accountIds
        })
      } catch (error) {
        reportLiqualityError(error)
      }
    },
    async sendNFT() {
      this.sendErrorMessage = ''
      this.loading = true
      try {
        const fee = this.feesAvailable ? this.assetFees[this.selectedFee].fee : undefined
        const data = {
          network: this.activeNetwork,
          accountId: this.account?.id,
          walletId: this.activeWalletId,
          receiver: this.address,
          contract: this.selectedNFT.asset_contract.address,
          tokenIDs: [this.selectedNFT.token_id],
          values: [1],
          fee,
          feeLabel: this.selectedFeeLabel,
          nft: this.selectedNFT
        }
        await this.sendNFTTransaction(data)
        await this.refreshNFTs()
        this.$router.replace(`/wallet/nfts/activity/${this.account?.id}?tab=activity`)
      } catch (error) {
        this.loading = false
        this.sendErrorMessage = errorToLiqualityErrorString(error)
        this.sendErrorModalOpen = true
      }
    },
    imageError(ref) {
      if (ref) {
        this.$refs[ref].src = this.thumbnailImage
      }
    },
    requestUpdateFees() {
      this.updatingFees = true
      Promise.all([
        this.updateFees({ asset: this.assetChain }),
        this.updateSendFees(this.amount)
      ]).finally(() => {
        setTimeout(() => {
          this.updatingFees = false
        }, 1000)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.account-container {
  .account-content {
    &-top {
      height: 220px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20px 0;
      background: $brand-gradient-primary;
      color: $color-text-secondary;
      text-align: center;
      position: relative;
    }
    button:disabled {
      opacity: 0.5;
      cursor: auto;
    }
  }
}

.nft-assets__container__images {
  padding: 0 10px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 5px;
  overflow-y: auto;
}

.nft-image {
  min-width: var(--img-width);

  svg {
    position: absolute;
    top: 4px;
    left: 4px;
  }

  img {
    width: 100%;
    height: 100%;
  }
}

.selected-nft-asset {
  h3 {
    font-size: 12px;
  }
  &__send-details {
    margin-top: 23px;
  }
  &__image {
    display: flex;
    align-items: center;

    h3 {
      font-size: 20px;
    }

    p {
      font-size: 16px;
    }

    h3,
    p {
      margin: 0;
    }
  }

  .input-group {
    border-bottom: 1px solid #2cd2cf;
  }
}

.button-group {
  padding: 16px 0;
}

.updating-fees {
  height: 24px !important;
  margin-top: -6px !important;
  circle {
    stroke: #dedede;
  }
}
</style>
