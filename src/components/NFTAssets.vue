<template>
  <div class="nft-assets">
    <div class="nft-assets__container">
      <div class="nft-assets__container__heading">
        <h5>{{ nftAsset.name }} ({{ nftAsset.number }})</h5>
        <span class="d-flex align-items-center">
          <ChevronRight />
          <button class="d-flex align-items-center" @click="goToNFTCollection">all</button>
        </span>
      </div>
      <div class="nft-assets__container__images">
        <div class="img-items" v-for="nft in nftAsset.number" :key="nft.id">
          <NFTAsset :nftAsset="nftAsset" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChevronRight from '@/assets/icons/chevron_right_gray.svg'
import NFTAsset from './NFTAsset.vue'
export default {
  props: {
    nftAsset: {
      type: Object,
      required: true
    }
  },
  components: {
    ChevronRight,
    NFTAsset
  },
  methods: {
    goToNFTCollection() {
      this.$router.push({
        path: `/details/nft-collection/${this.nftAsset.name}`,
        query: { nftAsset: this.nftAsset }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
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
        width: 100%;
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
}
</style>
