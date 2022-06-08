<template>
  <div class="nft-asset">
    <div class="nft-asset--container">
      <NavBar showBack="true" :backPath="'/wallet/nfts'" backLabel=""></NavBar>
      <div class="nft-action-buttons">
        <div class="star" :style="showFullscreen ? { top: '120px' } : { top: '40px' }">
          <Star :nftAsset="nftAsset" />
        </div>
        <div class="send--share--actions">
          <SendIcon
            class="nft-action-buttons__icon"
            @click="
              $router.push({
                path: '/wallet/nfts/send',
                query: { nftAsset: nftAsset, source: source }
              })
            "
          />
          <ShareIcon class="nft-action-buttons__icon" @click="transferNFT" />
        </div>
      </div>
      <template v-if="showFullscreen === false">
        <div class="nft-img">
          <img :src="nftAsset.image_url" alt="image" />
        </div>
        <div class="drawer nft-details">
          <div class="d-flex justify-content-between pointer-cursor">
            <h1 class="nft-details_name" v-if="nftAsset.name">{{ nftAsset.name }}</h1>
            <ChevronDownIcon
              class="nft-details_arrow"
              style="transform: scaleY(-1)"
              @click="showFullscreen = true"
            />
          </div>
          <h5 class="nft-details_collection-details" v-if="nftAsset.collection">
            {{ nftAsset.collection.name }}
          </h5>
        </div>
      </template>
      <template v-else-if="showFullscreen === true">
        <div class="nft-img__open">
          <img :src="nftAsset.image_preview_url" alt="image" />
        </div>
        <div class="drawer drawer-open nft-details">
          <div class="d-flex justify-content-between pointer-cursor">
            <h1 class="nft-details_name" v-if="nftAsset.name">{{ nftAsset.name }}</h1>
            <ChevronDownIcon
              class="nft-details_arrow cursor-pointer"
              @click="showFullscreen = false"
            />
          </div>
          <h5 class="nft-details_collection-details" v-if="nftAsset.collection">
            {{ nftAsset.collection.name }}
          </h5>
          <div class="wallet-tabs">
            <ul class="nav nav-tabs">
              <li class="nav-item">
                <span
                  :class="activeTab === 'overview' ? 'nav-link active' : 'nav-link'"
                  id="overview_tab"
                  @click="activeTab = 'overview'"
                >
                  Overview
                </span>
              </li>
              <li class="nav-item">
                <span
                  :class="activeTab === 'details' ? 'nav-link active' : 'nav-link'"
                  id="details_tab"
                  @click="activeTab = 'details'"
                >
                  Details
                </span>
              </li>
            </ul>
            <div class="wallet-tab-content py-1">
              <div>
                <div class="px-4 mt-2" v-if="activeTab === 'overview'">
                  <h5 class="nft-details_name">Bio</h5>
                  <p class="nft-details_name">
                    {{ nftAsset.description || 'This NFT does not have a description.' }}
                  </p>
                </div>
                <div class="table" v-if="activeTab === 'details'">
                  <table class="table bg-white border-0 mb-1 mt-1">
                    <tbody class="font-weight-normal">
                      <tr class="border-top-0">
                        <td class="text-muted text-left small-12">Account</td>
                        <td class="text-break" v-if="nftAsset.asset_contract">
                          <span class="text-primary d-flex align-items-center">
                            <img :src="getAssetIcon(nftAsset.asset)" class="asset-icon mr-1" />
                            {{ shortenAddress(address) }}
                            <CopyIcon @click="copy(address)" class="copy-icon"
                          /></span>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-muted text-left small-12">Contract Address</td>
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
                        <td class="text-muted text-left small-12" id="your_to_address">Token ID</td>
                        <td class="text-break" v-if="nftAsset.token_id">
                          <span class="text-primary">
                            {{ nftAsset.token_id }}
                            <CopyIcon @click="copy(nftAsset.token_id)" class="copy-icon"
                          /></span>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-muted text-left small-12">Token Standard</td>
                        <td class="text-break" v-if="nftAsset.asset_contract">
                          {{ nftAsset.asset_contract.schema_name }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-muted text-left small-12">Blockchain</td>
                        <td class="text-break text-capitalize">
                          <img :src="getAccountIcon(nftAsset.chain)" class="asset-icon" />
                          {{ nftAsset.chain }}
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
import { shortenAddress } from '@liquality/wallet-core/dist/utils/address'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import CopyIcon from '@/assets/icons/copy.svg'
import SendIcon from '@/assets/icons/send_nft.svg'
import ShareIcon from '@/assets/icons/share_nft.svg'
import NavBar from '../../components/NavBar.vue'
import { chains } from '@liquality/cryptoassets'
import { getAccountIcon } from '@/utils/accounts'
import { getAssetIcon } from '@/utils/asset'
import { getNftTransferLink } from '@liquality/wallet-core/dist/utils/asset'
import Star from '@/components/Star.vue'

export default {
  data() {
    return {
      showFullscreen: false,
      activeTab: 'overview',
      nftAsset: null
    }
  },
  components: {
    ChevronDownIcon,
    CopyIcon,
    SendIcon,
    ShareIcon,
    NavBar,
    Star
  },
  computed: {
    ...mapGetters(['accountsData']),
    ...mapState(['activeNetwork']),
    source() {
      return this.$route.fullPath
    },
    account() {
      return this.accountsData.filter((account) => account.chain === this.nftAsset.chain)[0]
    },
    address() {
      return chains[this.nftAsset.chain]?.formatAddress(
        this.account.addresses[0],
        this.activeNetwork
      )
    }
  },
  async created() {
    const nftAsset = await JSON.parse(localStorage.getItem('nftAsset'))
    if (nftAsset) {
      return (this.nftAsset = nftAsset)
    }
    return (this.nftAsset = this.$route.query.nftAsset)
  },
  destroyed() {
    localStorage.removeItem('nftAsset')
  },
  methods: {
    shortenAddress,
    getAccountIcon,
    getAssetIcon,
    getNftTransferLink,
    async copy(text) {
      await navigator.clipboard.writeText(text)
    },
    nftAssetImageSource(mode) {
      if (mode === 'thumbnail') {
        return this.nftAsset?.image_thumbnail_url
      } else if (mode === 'preview') {
        return this.nftAsset?.image_preview_url
      } else {
        return this.nftAsset?.image_url
      }
    },
    transferNFT() {
      window.open(
        getNftTransferLink(
          this.nftAsset.asset,
          this.activeNetwork,
          this.nftAsset.token_id,
          this.nftAsset.asset_contract.address
        )
      )
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

  &--container {
    height: 100%;
    display: flex;
    justify-content: center;
    position: relative;
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
    top: 20px;

    &__icon {
      cursor: pointer;
      width: 24px;
      margin-right: 0.5rem;
    }

    .star {
      position: fixed;
      left: 16px;
      cursor: pointer;
    }

    .send--share--actions {
      position: fixed;
      right: 0;
      display: flex;
      align-items: center;
    }
  }

  .drawer.nft-details {
    background: #ffffff;
    border: 1px solid #d9dfe5;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 20%;
    padding: 1rem;
    border-radius: 15px 15px 0 0;
    &_name {
      font-size: 14px;
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
