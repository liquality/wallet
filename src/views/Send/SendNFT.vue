<template>
  <div class="account-container">
    <NavBar
      showMenu="true"
      showBack="true"
      :backPath="routeSource"
      :backLabel="activeView === 'selectAsset' ? 'Overview' : 'Back'"
    >
      <span class="account-title">{{ title }}</span>
    </NavBar>
    <template v-if="activeView === 'selectAsset'">
      <div class="account-content mx-3">
        <div>
          <Accordion v-for="(assets, key) in nftAssets" :key="assets.id">
            <h3 slot="header">{{ key }} ({{ assets.length }})</h3>
            <div class="nft-assets__container__images">
              <div
                class="nft-image"
                style="--img-width: 110px"
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
                    :fill="selectedNFT && selectedNFT.id === asset.id ? '#646F85' : '#FFFFFF'"
                    stroke="#646F85"
                  />
                </svg>
                <img :src="asset.image_thumbnail_url" alt="" />
              </div>
            </div>
          </Accordion>
        </div>
      </div>
      <div class="button-group mx-3">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="cancel">Cancel</button>
        <button
          class="btn btn-primary btn-lg btn-icon"
          @click="next('selectedAsset')"
          :disabled="!selectedNFT"
        >
          Next
        </button>
      </div>
    </template>
    <template v-else-if="activeView === 'selectedAsset'">
      <div class="selected-nft-asset mx-3 mt-4 h-100">
        <div class="d-flex flex-column justify-content-between h-100">
          <div class="mb-3">
            <h3 class="text-uppercase">Selected Asset</h3>
            <div class="selected-nft-asset__image">
              <div class="nft-image mr-2" style="--img-width: 110px">
                <img :src="selectedNFT.image_thumbnail_url" alt="" />
              </div>
              <div>
                <h3>{{ selectedNFT.name }}</h3>
                <p>{{ selectedNFT.collection.name }}</p>
              </div>
            </div>
            <div class="selected-nft-asset__send-details">
              <h3 class="text-uppercase">Send From</h3>
              <div class="d-flex">
                <img :src="getAssetIcon(asset)" class="asset-icon mr-3" />
                <div>
                  <div class="d-flex">
                    <span class="mr-3">{{ asset }}</span>
                    <div class="mr-3">
                      <span class="mr-1">{{ shortenAddress(fromAddress) }}</span>
                      <span><CopyIcon class="copy-icon" @click="copy(fromAddress)" /></span>
                    </div>
                  </div>
                  <div class="text-muted">Available {{ balance }} ETH</div>
                </div>
              </div>
              <div class="form-group mt-4">
                <label for="address"><h3 class="text-uppercase">Send to</h3></label>
                <div class="input-group">
                  <input
                    type="text"
                    :class="{ 'is-invalid': address && addressError }"
                    v-model="address"
                    class="form-control form-control-sm"
                    id="address"
                    placeholder="Address"
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
          <DetailsContainer v-if="feesAvailable">
            <template v-slot:header>
              <div class="network-header-container">
                <span class="details-title" id="send_network_speed"> Network Speed/Fee </span>
                <span class="text-muted" id="send_network_speed_avg_fee">
                  ({{ selectedFeeLabel }} / {{ prettyFee }} {{ assetChain }})
                </span>
              </div>
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
                      <button class="btn btn-link" @click="resetCustomFee">Reset</button>
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
          <div class="button-group">
            <button class="btn btn-light btn-outline-primary btn-lg" @click="cancel">Cancel</button>
            <button
              class="btn btn-primary btn-lg btn-icon"
              @click="next('review')"
              :disabled="address === '' && !isValidAddress"
            >
              Review
            </button>
          </div>
        </div>
      </div>
    </template>
    <template class="send" v-else-if="activeView === 'custom-fees' && !isEIP1559Fees">
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
      <div class="selected-nft-asset mx-3 mt-4 h-100">
        <div class="d-flex flex-column justify-content-between h-100">
          <div>
            <h3 class="text-uppercase">Selected Asset</h3>
            <div class="selected-nft-asset__image">
              <div class="nft-image mr-2" style="--img-width: 110px">
                <img :src="selectedNFT.image_thumbnail_url" alt="" />
              </div>
              <div>
                <h3>{{ selectedNFT.name }}</h3>
                <p>{{ selectedNFT.collection.name }}</p>
              </div>
            </div>
            <div class="selected-nft-asset__send-details">
              <h3 class="text-uppercase">Network speed/fee</h3>
              <div class="d-flex justify-content-between">
                <p>{{ prettyFee }} ETH</p>
                <p>{{ totalFeeInFiat }} USD</p>
              </div>
              <div class="form-group mt-4">
                <h3 for="address" class="text-uppercase text-muted">Send to</h3>
                <p class="address">
                  <span class="font-weight-bold">{{ startAddress }}</span
                  >{{ middleAddressPart }}<span class="font-weight-bold">{{ endAddress }}</span>
                </p>
              </div>
            </div>
          </div>
          <div class="button-group">
            <button class="btn btn-light btn-outline-primary btn-lg" @click="next('selectedAsset')">
              Edit
            </button>
            <button class="btn btn-primary btn-lg btn-icon" @click="sendNFT" :disabled="loading">
              <SpinnerIcon class="btn-loading" v-if="loading" />
              <template v-else>Send NFT</template>
            </button>
          </div>
        </div>
      </div>
    </template>
    <OperationErrorModal
      :open="sendErrorModalOpen"
      :account="account"
      @close="closeSendErrorModal"
      :error="sendErrorMessage"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import NavBar from '@/components/NavBar.vue'
import { applyActivityFilters } from '@liquality/wallet-core/dist/utils/history'
import amplitude from 'amplitude-js'
import Accordion from '@/components/Accordion.vue'
import { chains, ChainId } from '@liquality/cryptoassets'
import { shortenAddress } from '@liquality/wallet-core/dist/utils/address'
import cryptoassets from '@liquality/wallet-core/dist/utils/cryptoassets'
import CopyIcon from '@/assets/icons/copy.svg'
import { getSendFee, getFeeLabel } from '@liquality/wallet-core/dist/utils/fees'
import { getFeeAsset, getNativeAsset } from '@liquality/wallet-core/dist/utils/asset'
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
} from '@liquality/wallet-core/dist/utils/coinFormatter'
import _ from 'lodash'
import BN from 'bignumber.js'

amplitude.getInstance().init('bf12c665d1e64601347a600f1eac729e')

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
      maxSendFees: {},
      eip1559fees: {},
      activityData: [],
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
      asset: 'ETH'
    }
  },
  async created() {
    await this.updateFees({ asset: this.assetChain })
    await this.updateSendFees(this.amount)
    await this.trackAnalytics({
      event: 'Send NFT screen',
      properties: {
        category: 'Send/Receive',
        action: 'User on Send NFT screen',
        label: `${this.asset}`
      }
    })
    if (this.$route.query.nftAsset) {
      this.selectedNFT = this.$route.query.nftAsset
      localStorage.setItem('nftAsset', JSON.stringify(this.selectedNFT))
      this.activeView = 'selectedAsset'
    }
    // if (this.nftAssets) {
    //   const firstCollection = this.nftAssets[Object.keys(this.nftAssets)[0]]
    //   console.log(
    //     '🚀 ~ file: SendNFT.vue ~ line 289 ~ created ~ firstCollection',
    //     firstCollection[0]
    //   )
    //   this.selectNFT(firstCollection[0])
    // }
  },
  computed: {
    ...mapGetters(['activity', 'accountItem', 'accountsData']),
    ...mapState([
      'activeNetwork',
      'activeWalletId',
      'history',
      'nftAssetsNumber',
      'nftAssets',
      'externalConnections',
      'fees',
      'fiatRates'
    ]),
    title() {
      switch (this.activeView) {
        case 'selectAsset':
          return 'Select NFT'
        case 'selectedAsset':
          return 'Send NFT'
        case 'custom-fees':
          return 'Custom Fees'
        case 'review':
          return 'Review Send NFT'

        default:
          return ''
      }
    },
    // routeQuery() {
    //   if (this.$route.query?.source?.includes('/details/nft-asset')) {
    //     return {
    //       source: this.$route.query.source,
    //       nftAsset: this.$route.query.nftAsset
    //     }
    //   }
    //   return {}
    // },
    routeSource() {
      if (this.$route.query?.source?.includes('/details/nft-asset')) {
        // JSON.stringify(this.selectedNFT)
        return `${this.$route.query.source}`
      }
      return this.$route.query.source
    },
    totalFeeInFiat() {
      return prettyFiatBalance(this.currentFee, this.fiatRates[this.assetChain])
    },
    account() {
      return this.accountsData.filter((account) => account.chain === 'ethereum')[0]
    },
    assetHistory() {
      return this.activity.filter((item) => item.from === this.asset)
    },
    balance() {
      const balance = this.account.balances?.[this.asset] || 0
      return prettyBalance(balance, this.asset)
    },
    fromAddress() {
      return chains['ethereum']?.formatAddress(this.account.addresses[0], this.activeNetwork)
    },
    isValidAddress() {
      return chains['ethereum'].isValidAddress(this.fromAddress, this.activeNetwork)
    },
    addressError() {
      if (!this.isValidAddress) {
        return 'Wrong format. Please check the address.'
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
      return getNativeAsset(this.asset)
    },
    assetFees() {
      const assetFees = {}
      if (this.customFee) {
        assetFees.custom = { fee: this.customFee }
      }

      const fees = this.fees[this.activeNetwork]?.[this.activeWalletId]?.[this.assetChain]
      if (fees) {
        Object.assign(assetFees, fees)
      }
      return assetFees
    },
    feesAvailable() {
      return this.assetFees && Object.keys(this.assetFees).length
    },
    isEIP1559Fees() {
      return cryptoassets[this.asset].chain === ChainId.Ethereum
    },
    showMemoInput() {
      return cryptoassets[this.asset].chain === ChainId.Terra
    },
    memoData() {
      return {
        memo: this.memo
      }
    },
    startAddress() {
      return this.address.slice(0, 6)
    },
    middleAddressPart() {
      return this.address.substring(6, this.address.length - 4)
    },
    endAddress() {
      return this.address.slice(this.address.length - 4)
    }
  },
  methods: {
    ...mapActions(['sendNFTTransaction', 'updateFees', 'trackAnalytics']),
    getAssetIcon,
    shortenAddress,
    formatFiat,
    formatFiatUI,
    prettyBalance,
    getFeeAsset,
    getSendFee,
    getFeeLabel,
    getNativeAsset,
    applyFilters(filters) {
      this.activityData = applyActivityFilters([...this.assetHistory], filters)
    },
    async copy(text) {
      await navigator.clipboard.writeText(text)
    },
    selectNFT(asset) {
      console.log('asset>>>', asset)
      console.log('account>>>', this.account)
      this.selectedNFT = asset
    },
    cancel() {
      this.$router.push({
        path: '/wallet/nfts'
      })
    },
    closeSendErrorModal() {
      this.sendErrorModalOpen = false
      this.loading = false
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
        this.updateMaxSendFees()
        this.updateSendFees(this.amount)
        this.customFee = typeof fee === 'object' ? fee.maxFeePerGas + fee.maxPriorityFeePerGas : fee
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
    async _updateSendFees(amount) {
      const getMax = amount === undefined
      if (this.feesAvailable) {
        const sendFees = {}

        for (const [speed, fee] of Object.entries(this.assetFees)) {
          const feePrice = fee.fee.maxPriorityFeePerGas + fee.fee.suggestedBaseFeePerGas || fee.fee
          sendFees[speed] = getSendFee(this.assetChain, feePrice)
        }

        if (getMax) {
          this.maxSendFees = sendFees
        } else {
          this.sendFees = sendFees
        }
      }
    },
    updateSendFees: _.debounce(async function (amount) {
      await this._updateSendFees(amount)
    }, 800),
    async updateMaxSendFees() {
      await this._updateSendFees()
    },
    async sendNFT() {
      this.sendErrorMessage = ''
      this.loading = true
      try {
        const fee = this.feesAvailable ? this.assetFees[this.selectedFee].fee : undefined
        const data = {
          network: this.activeNetwork,
          accountId: this.account.id,
          walletId: this.activeWalletId,
          contract: this.selectedNFT.asset_contract.address,
          receiver: this.address,
          tokenIDs: [this.selectedNFT.token_id],
          values: [1],
          nft: this.selectedNFT,
          fee,
          feeLabel: this.selectedFeeLabel,
          fiatRate: this.fiatRates[this.asset]
        }
        await this.sendNFTTransaction(data)
        this.$router.replace(`/wallet/nfts/activity`)
      } catch (error) {
        const { message } = error
        this.loading = false
        this.sendErrorMessage = message || error
        this.sendErrorModalOpen = true
      }
    }
  },
  watch: {
    activeNetwork() {
      this.activityData = [...this.assetHistory]
    }
  }
}
</script>

<style lang="scss" scoped>
.account-container {
  overflow-y: scroll;
  padding-bottom: 2rem;

  .account-content-top {
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
</style>
