<template>
  <div class="nft-asset">
    <div class="nft-asset--container">
      <NavBar showBack="true" :backPath="'/wallet/nfts'" backLabel=""></NavBar>
      <div class="nft-action-buttons">
        <div class="star" :style="showFullscreen ? { top: '120px' } : { top: '40px' }">
          <svg
            width="23"
            height="26"
            viewBox="0 0 23 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            @click="toggleStarred"
          >
            <path
              d="M11 4.91214L12.7683 9.74879L13.7075 9.4054L12.7684 9.74879C13.0273 10.4571 13.6627 10.9595 14.4116 11.0481L19.9428 11.7031L15.6202 15.3165C14.9733 15.8573 14.735 16.7458 15.0246 17.5378L16.7359 22.2183L12.0235 19.4113C11.3928 19.0356 10.6071 19.0356 9.97644 19.4113L5.26402 22.2183L6.99558 17.4824C7.26483 16.746 7.07891 15.9202 6.52005 15.3702L2.79281 11.7021L7.61575 11.0543C8.35201 10.9554 8.9728 10.4566 9.22789 9.75887L11 4.91214Z"
              :fill="nftAsset.starred ? '#EAB300' : 'white'"
              :stroke="nftAsset.starred ? '#EAB300' : 'none'"
              stroke-width="2"
            />
            <path
              d="M20.625 10.2188C21.1458 10.2708 21.4844 10.5443 21.6406 11.0391C21.7969 11.5339 21.6927 11.9635 21.3281 12.3281L17.1875 16.3516L18.1641 22.0547C18.2422 22.5495 18.0729 22.9401 17.6562 23.2266C17.2396 23.5391 16.8099 23.5781 16.3672 23.3438L11.25 20.6875L6.13281 23.3438C5.6901 23.6042 5.26042 23.5781 4.84375 23.2656C4.42708 22.9531 4.25781 22.5495 4.33594 22.0547L5.3125 16.3516L1.17188 12.3281C0.807292 11.9635 0.703125 11.5339 0.859375 11.0391C1.01562 10.5443 1.35417 10.2708 1.875 10.2188L7.57812 9.35938L10.1172 4.20312C10.3516 3.73438 10.7292 3.5 11.25 3.5C11.7708 3.5 12.1484 3.73438 12.3828 4.20312L14.9219 9.35938L20.625 10.2188ZM15.8594 15.9219L20.4688 11.4297L14.1016 10.5312L11.25 4.75L8.39844 10.5312L2.03125 11.4297L6.64062 15.9219L5.54688 22.25L11.25 19.2812L16.9531 22.25L15.8594 15.9219Z"
              :fill="nftAsset.starred ? '#D9DFE5' : '#D9DFE5'"
            />
          </svg>
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
          <ShareIcon class="nft-action-buttons__icon" @click="openOnOpenSea" />
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
                            <img :src="getAccountIcon(account.chain)" class="asset-icon" />
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
                        <td class="text-break">
                          <img :src="getAssetIcon(asset)" class="asset-icon" />
                          Ethereum
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
import { mapGetters, mapMutations, mapState } from 'vuex'
import { shortenAddress } from '@liquality/wallet-core/dist/utils/address'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import CopyIcon from '@/assets/icons/copy.svg'
import SendIcon from '@/assets/icons/send_nft.svg'
import ShareIcon from '@/assets/icons/share_nft.svg'
import NavBar from '../../components/NavBar.vue'
import { chains } from '@liquality/cryptoassets'
import { getAssetIcon } from '@/utils/asset'
import { getAccountIcon } from '@/utils/accounts'

export default {
  data() {
    return {
      showFullscreen: false,
      activeTab: 'overview',
      asset: 'ETH',
      nftAsset: null
    }
  },
  components: {
    ChevronDownIcon,
    CopyIcon,
    SendIcon,
    ShareIcon,
    NavBar
  },
  computed: {
    ...mapGetters(['accountsData']),
    ...mapState(['activeNetwork']),
    source() {
      return this.$route.fullPath
    },
    account() {
      return this.accountsData.filter((account) => account.chain === 'ethereum')[0]
    },
    address() {
      return chains['ethereum']?.formatAddress(this.account.addresses[0], this.activeNetwork)
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
    ...mapMutations(['SET_STARRED_NFTS']),
    shortenAddress,
    getAssetIcon,
    getAccountIcon,
    async copy(text) {
      await navigator.clipboard.writeText(text)
    },
    nftAssetImageSource(mode) {
      if (mode === 'thumbnail') {
        return this.nftAsset.image_thumbnail_url
      } else if (mode === 'preview') {
        return this.nftAsset.image_preview_url
      } else {
        return this.nftAsset.image_url
      }
    },
    openOnOpenSea() {
      window.open(
        `http://${this.activeNetwork === 'testnet' ? 'testnets.' : ''}opensea.io/assets/${
          this.nftAsset.asset_contract.address
        }/${this.nftAsset.token_id}`,
        '_blank'
      )
    },
    async toggleStarred() {
      this.nftAsset.starred = !this.nftAsset.starred
      this.SET_STARRED_NFTS(this.nftAsset)
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
