<template>
  <div class="nft-asset">
    <div class="nft-asset--container">
      <NavBar
        :showBack="true"
        :backPath="routeSource"
        :backLabel="$t('common.back')"
        :hasSolidButton="true"
        :fullWidth="true"
      ></NavBar>
      <div class="nft-action-buttons">
        <div
          class="star"
          :style="showFullscreen ? { top: 'calc(25% - 41px)' } : { bottom: 'calc(20% + 41px)' }"
        >
          <Star :nftAsset="nftAsset" :accountId="accountId" />
        </div>
        <NFTQuantity
          :quantity="nftAsset?.amount"
          :style="showFullscreen ? { top: 'calc(25% - 34px)' } : { bottom: 'calc(20% + 10px)' }"
          v-if="nftAsset && nftAsset.amount && nftAsset.amount > 1"
        />
        <div class="send--share--actions">
          <SendIcon
            class="nft-action-buttons__icon"
            @click="
              $router.push({
                path: '/wallet/nfts/send',
                query: {
                  nftAsset: nftAsset.token_id,
                  source: source,
                  collection: nftAsset.collection?.name,
                  accountId: accountId
                }
              })
            "
            v-tooltip.bottom="{
              content: $t('common.sendNFT'),
              hideOnTargetClick: false
            }"
          />
          <ShareIcon
            v-if="transferLink"
            class="nft-action-buttons__icon"
            @click="transferNFT"
            v-tooltip.left="{
              content: $t('pages.details.transferOn', { marketplace: marketplaceName() }),
              hideOnTargetClick: false
            }"
          />
        </div>
      </div>
      <template v-if="showFullscreen === false">
        <div class="nft-img">
          <img
            ref="nftImage"
            :src="
              assetOriginalImageUrl(nftAsset?.image_original_url) ||
              nftAsset?.image_preview_url ||
              thumbnailImage
            "
            :alt="nftAsset?.name || 'NFT Asset'"
            @error="imageError('nftImage')"
          />
        </div>
        <div class="drawer nft-details">
          <div class="d-flex justify-content-between pointer-cursor">
            <h1 class="nft-details_name">
              {{ nftAsset && nftAsset?.asset_contract ? nftAsset?.asset_contract?.name : '[Name]' }}
            </h1>
            <ChevronDownIcon
              class="nft-details_arrow"
              style="transform: scaleY(-1)"
              @click="showFullscreen = true"
            />
          </div>
          <h5 class="nft-details_collection-details">
            {{ nftAsset && nftAsset.collection?.name ? nftAsset?.collection.name : '[Collection]' }}
          </h5>
        </div>
      </template>
      <template v-else-if="showFullscreen === true">
        <div
          class="nft-img__open"
          :style="
            !(nftAsset?.image_original_url || nftAsset?.image_preview_url) && {
              background: '#D9DFE5'
            }
          "
        >
          <img
            ref="nftPreviewImage"
            :src="
              assetOriginalImageUrl(nftAsset?.image_original_url) ||
              nftAsset?.image_preview_url ||
              thumbnailImage
            "
            :alt="nftAsset?.name || 'NFT Asset'"
            @error="imageError('nftPreviewImage')"
          />
        </div>
        <div class="drawer drawer-open nft-details">
          <div class="d-flex justify-content-between pointer-cursor">
            <h1 class="nft-details_name">
              {{ nftAsset && nftAsset?.asset_contract ? nftAsset?.asset_contract?.name : '' }}
            </h1>
            <ChevronDownIcon
              class="nft-details_arrow cursor-pointer"
              @click="showFullscreen = false"
            />
          </div>
          <h5 class="nft-details_collection-details">
            {{ nftAsset ? nftAsset.collection.name : '' }}
          </h5>
          <div class="wallet-tabs">
            <ul class="nav nav-tabs">
              <li class="nav-item">
                <span
                  :class="activeTab === 'overview' ? 'nav-link active' : 'nav-link'"
                  id="overview_tab"
                  @click="activeTab = 'overview'"
                >
                  {{ $t('common.overview') }}
                </span>
              </li>
              <li class="nav-item">
                <span
                  :class="activeTab === 'details' ? 'nav-link active' : 'nav-link'"
                  id="details_tab"
                  @click="activeTab = 'details'"
                >
                  {{ $t('pages.details.details') }}
                </span>
              </li>
            </ul>
            <div class="wallet-tab-content py-1">
              <div>
                <div class="px-4 mt-2" v-if="activeTab === 'overview'">
                  <h5 class="text-bold">{{ $t('pages.details.description') }}</h5>
                  <markdown-it-vue-light
                    class="md-body"
                    :content="nftAsset.description || defaultDescription"
                  />
                </div>
                <div class="table" v-if="activeTab === 'details'">
                  <table class="table bg-white border-0 mb-1 mt-1">
                    <tbody class="font-weight-normal">
                      <tr class="border-top-0">
                        <td class="text-muted text-left small-12">
                          {{ $t('common.account', { count: 1 }) }}
                        </td>
                        <td class="text-break" v-if="nftAsset.asset_contract">
                          <a
                            class="text-primary d-flex align-items-center"
                            :href="addressLink"
                            target="_blank"
                          >
                            <img :src="getAssetIcon(asset)" class="asset-icon mr-1" />
                            {{ shortenAddress(address) }}
                            <CopyIcon @click="copy(address)" class="copy-icon"
                          /></a>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-muted text-left small-12">
                          {{ $t('common.contractAddress') }}
                        </td>
                        <td class="text-break" v-if="nftAsset.asset_contract">
                          <span class="text-primary d-flex align-items-center">
                            {{ shortenAddress(nftAsset.asset_contract.address) }}
                            <CopyIcon
                              @click="copy(nftAsset.asset_contract.address)"
                              class="copy-icon"
                          /></span>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-muted text-left small-12" id="your_to_address">
                          {{ $t('common.tokenID') }}
                        </td>
                        <td class="text-break" v-if="nftAsset.token_id">
                          <span class="text-primary">
                            {{ nftAsset.token_id }}
                            <CopyIcon @click="copy(nftAsset.token_id)" class="copy-icon"
                          /></span>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-muted text-left small-12">
                          {{ $t('common.tokenStandard') }}
                        </td>
                        <td class="text-break">
                          {{ nftAsset.standard || '-' }}
                        </td>
                      </tr>
                      <tr v-if="nftAsset.amount && nftAsset.amount > 1">
                        <td class="text-muted text-left small-12">
                          {{ $t('pages.details.youOwn') }}
                        </td>
                        <td class="text-break">{{ nftAsset.amount }}</td>
                      </tr>
                      <tr>
                        <td class="text-muted text-left small-12">Blockchain</td>
                        <td class="text-break text-capitalize">
                          <img :src="getAccountIcon(chain)" class="asset-icon" />
                          {{ chain }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { shortenAddress } from '@liquality/wallet-core/dist/src/utils/address'
import MarkdownItVueLight from 'markdown-it-vue/dist/markdown-it-vue-light.umd.min.js'
import 'markdown-it-vue/dist/markdown-it-vue-light.css'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import CopyIcon from '@/assets/icons/copy.svg'
import SendIcon from '@/assets/icons/send_nft.svg'
import ShareIcon from '@/assets/icons/share_nft.svg'
import NavBar from '../../components/NavBar.vue'
import { getChain, getNativeAssetCode } from '@liquality/cryptoassets'
import { getAccountIcon } from '@/utils/accounts'
import { getAssetIcon } from '@/utils/asset'
import {
  getNftTransferLink,
  getMarketplaceName,
  getAddressExplorerLink
} from '@liquality/wallet-core/dist/src/utils/asset'
import Star from '@/components/icons/Star.vue'
import NFTQuantity from '@/components/icons/NFTQuantity.vue'
import NFTThumbnailImage from '@/assets/nft_thumbnail.png'

export default {
  data() {
    return {
      showFullscreen: false,
      activeTab: 'overview',
      nftAsset: null,
      accountId: '',
      defaultDescription: 'This NFT has no description.'
    }
  },
  components: {
    ChevronDownIcon,
    CopyIcon,
    SendIcon,
    ShareIcon,
    NavBar,
    Star,
    NFTQuantity,
    MarkdownItVueLight
  },
  computed: {
    ...mapGetters(['accountItem', 'allNftCollections']),
    ...mapState(['activeNetwork']),
    source() {
      return this.$route.fullPath
    },
    thumbnailImage() {
      return NFTThumbnailImage
    },
    account() {
      return this.accountItem(this.accountId)
    },
    address() {
      return getChain(this.activeNetwork, this.account.chain)?.formatAddressUI(
        this.account.addresses[0]
      )
    },
    routeSource() {
      if (this.$route.query?.source) {
        return `${this.$route.query.source}`
      }
      return '/wallet/nfts'
    },
    chain() {
      return this.account?.chain
    },
    asset() {
      return this.account ? getNativeAssetCode(this.activeNetwork, this.account?.chain) : null
    },
    addressLink() {
      return getAddressExplorerLink(this.address, this.asset, this.activeNetwork)
    }
  },
  created() {
    const collectionName = this.$route.query.collection

    const nftAssetId = this.$route.query.nftAsset

    if (this.allNftCollections[collectionName]) {
      this.nftAsset = this.allNftCollections[collectionName].find((i) => {
        return i.token_id == nftAssetId
      })
      if (this.$route.query.accountId) {
        this.accountId = this.$route.query.accountId
      } else {
        this.accountId = this.nftAsset.accountId
      }
    }
  },
  methods: {
    shortenAddress,
    getAccountIcon,
    getAssetIcon,
    getNftTransferLink,
    getMarketplaceName,
    async copy(text) {
      await navigator.clipboard.writeText(text)
    },
    marketplaceName() {
      if (this.asset) {
        return getMarketplaceName(this.asset, this.activeNetwork)
      }
      return ''
    },
    transferLink() {
      return getNftTransferLink(
        this.asset,
        this.activeNetwork,
        this.nftAsset?.token_id,
        this.nftAsset?.asset_contract.address
      )
    },
    transferNFT() {
      window.open(this.transferLink(), '_blank')
    },
    imageError(ref) {
      if (ref) {
        this.$refs[ref].src = this.thumbnailImage
      }
    },
    assetOriginalImageUrl(url) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }
  }
}
</script>

<style lang="scss" scoped>
.nft-asset {
  position: absolute;
  background: #f8f5f5;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;

  .navbar {
    border-bottom: none !important;
  }

  &--container {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    position: absolute;
    top: 0;
  }

  .nft-img {
    width: 100%;
    height: 85%;
    display: flex;
    justify-content: center;
    &__open {
      width: 100%;
      height: 25%;
      display: flex;
      justify-content: center;
    }

    img {
      height: 100%;
      object-fit: cover;
      border: 1px solid #c4c4c4 !important;
    }
  }

  .nft-action-buttons {
    display: flex;
    justify-content: space-between;
    position: fixed;
    top: 15px;

    &__icon {
      cursor: pointer;
      width: 24px;
      margin-right: 0.5rem;
    }

    .star,
    .nft-quantity {
      position: fixed;
    }
    .star {
      left: 16px;
      cursor: pointer;
    }

    .nft-quantity {
      left: 50px;
    }

    .send--share--actions {
      position: fixed;
      right: 0;
      display: flex;
      align-items: center;
    }
  }

  .nft-details {
    .markdown-body {
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;

      & a {
        color: #9d4dfa !important;
        text-decoration: none;
      }
    }
    &.drawer {
      background: #ffffff;
      border: 1px solid #d9dfe5;
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 20%;
      padding: 1rem;
      border-radius: 15px 15px 0 0;
    }
    &_name {
      font-size: 20px;
      line-height: 26px;
      font-weight: 600;
    }
    &_collection-details {
      font-size: 14px;
      line-height: 21px;
      font-weight: 500;
    }
  }

  .drawer-open {
    height: 75% !important;
    overflow-y: scroll;
  }

  &::after {
    position: absolute;
    content: '';
  }

  .nft-details_arrow {
    width: 24px;
    cursor: pointer;
  }
}

.wallet-tabs {
  margin: 0 -1rem;
}
.nav-tabs {
  height: 48px;
  cursor: pointer;
  border-bottom: none !important;

  .nav-item {
    width: 50%;
    height: 100%;
    margin-bottom: none !important;

    .nav-link {
      height: 100%;
      font-size: $font-size-sm;
      font-weight: 500;
      text-transform: uppercase;
      color: #646f85;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none !important;
      border-bottom: 1px solid $hr-border-color !important;
      padding: 0 !important;
      &.active,
      &:hover {
        color: #000d35 !important;
        font-weight: 600;
        border: none !important;
        border-bottom: 1px solid #1d1e21 !important;
      }
    }
  }
}

.wallet-tab-content {
  a {
    color: $color-text-primary;
  }
  a:hover {
    text-decoration: none;
  }

  .table {
    table {
      tr {
        padding: 12px 20px !important;
      }
    }
  }
}
</style>
