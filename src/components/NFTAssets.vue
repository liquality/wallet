<template>
  <div class="nft-assets">
    <div class="nft-assets__container">
      <div class="nft-assets__container__heading">
        <h5>{{ collectionName }} ({{ nftAssets.length }})</h5>
        <span class="d-flex align-items-center">
          <router-link
            class="d-flex align-items-center link"
            :to="{
              path: `/details/nft-collection/${collectionName}`,
              query: {
                collectionName: collectionName,
                source: source
              }
            }"
            >see all</router-link
          >
        </span>
      </div>
      <div class="nft-assets__container__images">
        <div class="img-items" v-for="nft in nftAssets" :key="nft.id">
          <NFTAsset :nftAsset="nft" :mode="'thumbnail'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NFTAsset from './NFTAsset.vue'
export default {
  props: {
    nftAssets: {
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
    }
  },
  components: {
    NFTAsset
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
      column-gap: 12px;
      width: 100%;
      overflow: auto;
      justify-content: start;
      align-items: center;
      .img-items {
        margin-right: 20px;
        img {
          width: var(--img-width);
          border-radius: 10px;

          &.img-active {
            transform: translateX(-100%);
          }
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
