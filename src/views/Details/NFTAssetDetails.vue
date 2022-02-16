<template>
  <div class="nft-asset">
    <template v-if="showFullscreen === false">
      <img :src="nftAsset.image_thumbnail_url" alt="image" />
      <div class="drawer nft-details">
        <div class="d-flex justify-content-between pointer-cursor">
          <h1 class="nft-details_name" v-if="nftAsset.name">{{ nftAsset.name }}</h1>
          <ArrowDown
            class="nft-details_arrow"
            style="transform: scaleY(-1)"
            @click="showFullscreen = true"
          />
        </div>
        <h5 class="nft-details_collection-details" v-if="nftAsset.collection">
          {{ nftAsset.collection.name }}
        </h5>
        <h5 class="nft-details_collection-details" v-if="nftNumber">#{{ nftNumber }}</h5>
      </div>
    </template>
    <template v-else-if="showFullscreen === true">
      <img :src="nftAsset.image_preview_url" alt="image" />
      <div class="drawer drawer-open nft-details">
        <div class="d-flex justify-content-between pointer-cursor">
          <h1 class="nft-details_name" v-if="nftAsset.name">{{ nftAsset.name }}</h1>
          <ArrowDown class="nft-details_arrow" @click="showFullscreen = false" />
        </div>
        <h5 class="nft-details_collection-details" v-if="nftAsset.collection">
          {{ nftAsset.collection.name }}
        </h5>
        <h5 class="nft-details_collection-details" v-if="nftNumber">#{{ nftNumber }}</h5>
        <div class="wallet-tabs">
          <ul class="nav nav-tabs">
            <li class="nav-item">
              <span
                :class="activeTab === 'overview' ? 'nav-link' : 'nav-link active'"
                id="asserts_tab"
                @click="activeTab = 'overview'"
              >
                Overview
              </span>
            </li>
            <li class="nav-item">
              <span class="nav-link" id="asserts_tab" @click="activeTab = 'details'">
                Details
              </span>
            </li>
          </ul>
          <div class="wallet-tab-content">
            <div class="mt-2">
              <h1 class="nft-details_name">Bio</h1>
              <p class="nft-details_name" v-if="nftAsset.description">{{ nftAsset.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import ArrowDown from '@/assets/icons/arrow-down.svg'
export default {
  data() {
    return {
      showFullscreen: false,
      activeTab: 'overview'
    }
  },
  components: {
    ArrowDown
  },
  created() {
    console.log('NFTAsssetDetails', this.$route)
  },
  computed: {
    nftAsset() {
      return this.$route.query.nftAsset
    },
    nftNumber() {
      const number = this.nftAsset.external_link.split('/')
      return number[number.length - 1]
    }
  },
  methods: {
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

  .drawer.nft-details {
    background: #ffffff;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 120px;
    padding: 1rem 2rem;
    border-radius: 15px 15px 0 0;
    &_name {
      font-size: 18px;
      line-height: 26px;
      font-weight: 500;
    }
    &_collection-details {
      font-size: 14px;
      line-height: 21px;
      font-weight: 500;
    }
  }

  .drawer-open {
    height: 400px !important;
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
  margin: 0;
  padding: -1rem -2rem;
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
      & .active {
        color: initial !important;
      }
    }

    .nav-link:hover,
    .router-link-active {
      color: #000d35;
      font-weight: 600;
      border: none !important;
      border-bottom: 1px solid #1d1e21 !important;
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
}
</style>
