<template>
  <div class="nft-asset">
    <NavBar showBack="true" :backPath="'/wallet/nfts'" :backLabel="''"> </NavBar>
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
          <div class="wallet-tab-content">
            <div class="mt-2">
              <template v-if="activeTab === 'overview'">
                <h5 class="nft-details_name">Bio</h5>
                <p class="nft-details_name" v-if="nftAsset.description">
                  {{ nftAsset.description }}
                </p>
              </template>
              <template v-if="activeTab === 'details'">
                <!-- <ul></ul> -->
                <div class="d-flex justify-content-between">
                  <h5 class="nft-details_name">Creator</h5>
                  <p class="nft-details_name text-underline" v-if="nftAsset.creator">
                    {{ shortenAddress(nftAsset.creator.address) }}
                  </p>
                </div>
                <div class="d-flex justify-content-between">
                  <h5 class="nft-details_name">Contract Address</h5>
                  <p class="nft-details_name text-underline" v-if="nftAsset.asset_contract">
                    {{ shortenAddress(nftAsset.asset_contract.address) }}
                  </p>
                </div>
                <div class="d-flex justify-content-between">
                  <h5 class="nft-details_name">Token ID</h5>
                  <p class="nft-details_name text-underlin text-break" v-if="nftAsset.token_id">
                    {{ nftAsset.token_id }}
                  </p>
                </div>
                <div class="d-flex justify-content-between">
                  <h5 class="nft-details_name">Token Standard</h5>
                  <p
                    class="nft-details_name text-underline text-break"
                    v-if="nftAsset.asset_contract"
                  >
                    {{ nftAsset.asset_contract.schema_name }}
                  </p>
                </div>
                <div class="d-flex justify-content-between">
                  <h5 class="nft-details_nam">Blockchain</h5>
                  <p class="nft-details_name text-underline">Ethereum</p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { shortenAddress } from '@liquality/wallet-core/dist/utils/address'
import ChevronDownIcon from '@/assets/icons/chevron_down.svg'
import NavBar from '../../components/NavBar.vue'
export default {
  data() {
    return {
      showFullscreen: false,
      activeTab: 'overview'
    }
  },
  components: {
    ChevronDownIcon,
    NavBar
  },
  computed: {
    nftAsset() {
      return this.$route.query.nftAsset
    }
  },
  methods: {
    shortenAddress,
    nftAssetImageSource(mode) {
      if (mode === 'thumbnail') {
        return this.nftAsset.image_thumbnail_url
      } else if (mode === 'preview') {
        return this.nftAsset.image_preview_url
      } else {
        return this.nftAsset.image_url
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.nft-asset {
  height: 100%;
  display: flex;
  justify-content: center;
  position: relative;

  .nft-img {
    width: 100%;
    height: 80%;
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
    }
  }

  .drawer.nft-details {
    background: #ffffff;
    border: 1px solid #d9dfe5;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 20%;
    padding: 1rem 2rem;
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
  }

  &::after {
    position: absolute;
    content: '';
  }

  .nft-details_arrow {
    width: 24px;
  }
}

.wallet-tabs {
  // margin: 0;
  margin: 0 -2rem;
}
.nav-tabs {
  height: 48px;
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
  padding: 1rem 2rem;
  a {
    color: $color-text-primary;
  }
  a:hover {
    text-decoration: none;
  }
}
</style>
