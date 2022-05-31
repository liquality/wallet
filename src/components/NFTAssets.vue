<template>
  <div class="nft-assets">
    <div class="nft-assets__container">
      <div class="nft-assets__container__heading">
        <h5>{{ collectionName }} ({{ nftCollection.length }})</h5>
        <span class="d-flex align-items-center" v-if="!isAccount">
          <router-link
            class="d-flex align-items-center link"
            :to="{
              path: `/details/nft-collection/${collectionName}`,
              query: {
                collectionName: collectionName,
                source: source,
                isAccount: isAccount
              }
            }"
            >see all</router-link
          >
        </span>
      </div>
      <div
        class="nft-assets__container__images"
        :class="{ 'nft-assets__container__images--is-account': isAccount }"
      >
        <template v-for="nft in isAccount ? assets : firstThreeAssets">
          <NFTAsset :nftAsset="nft" :mode="'thumbnail'" :key="nft.id" />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ChainId } from '@liquality/cryptoassets'
import NFTAsset from './NFTAsset.vue'
export default {
  props: {
    assets: {
      type: Array,
      required: true
    },
    collectionName: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: false
    },
    isAccount: {
      type: Boolean,
      default: false
    }
  },
  components: {
    NFTAsset
  },
  computed: {
    ...mapGetters(['nftAssetsByCollection', 'nftAssetsByAccount']),
    nftCollection() {
      if (this.isAccount) {
        return this.nftAssetsByAccount[ChainId.Ethereum][this.collectionName]
      } else {
        return this.nftAssetsByCollection[this.collectionName]
      }
    },
    firstThreeAssets() {
      return this.assets.slice(0, 3)
    }
  }
}
</script>

<style lang="scss">
.nft-assets {
  padding: 0 16px;

  &__container {
    &__heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 18px;
      margin-bottom: 16px;
      h5 {
        font-size: 16px;
        line-height: 20.63px;
      }
    }
    &__images {
      display: flex;
      gap: 12px;
      width: 100%;
      overflow: auto;
      justify-content: start;
      align-items: center;
      margin-right: 20px;

      &--is-account {
        flex-wrap: wrap;
      }

      img {
        width: var(--img-width);
        border-radius: 10px;

        &.img-active {
          transform: translateX(-100%);
        }
      }
    }
  }

  .link {
    color: $color-primary;
    font-weight: 600;
  }
}
</style>
