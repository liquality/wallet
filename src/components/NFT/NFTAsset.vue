<template>
  <div class="nft-image" style="--img-width: 100px">
    <Star :nftAsset="nftAsset" :accountId="accountId" />
    <NFTQuantity :quantity="nftAsset.amount" v-if="nftAsset.amount && nftAsset.amount > 1" />
    <img
      ref="nftThumbnailImage"
      :src="nftAssetImageSource || thumbnailImage"
      :alt="nftAsset.name || 'NFT Asset'"
      @click="viewNFTDetails"
      @error="imageError('nftThumbnailImage')"
    />
  </div>
</template>

<script>
import Star from '@/components/icons/Star'
import NFTQuantity from '@/components/icons/NFTQuantity.vue'
import NFTThumbnailImage from '@/assets/nft_thumbnail.png'

export default {
  components: {
    Star,
    NFTQuantity
  },
  props: {
    nftAsset: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      required: true
    },
    accountId: {
      type: String,
      required: false
    }
  },
  computed: {
    thumbnailImage() {
      return NFTThumbnailImage
    },
    nftAssetImageSource() {
      if (this.mode === 'thumbnail') {
        return this.nftAsset.image_thumbnail_url
      } else if (this.mode === 'preview') {
        return this.nftAsset.image_preview_url
      } else {
        return this.thumbnailImage
      }
    }
  },
  methods: {
    viewNFTDetails() {
      if (this.nftAsset) {
        this.$router.push({
          path: `/details/nft-asset/${this.nftAsset.token_id}`,
          query: {
            collection: this.nftAsset.collection?.name,
            nftAsset: this.nftAsset.token_id,
            accountId: this.accountId,
            source: this.$route.fullPath
          }
        })
      }
    },
    imageError(ref) {
      if (ref) {
        this.$refs[ref].src = this.thumbnailImage
      }
    }
  }
}
</script>

<style lang="scss">
.nft-image {
  width: var(--img-width);
  height: var(--img-width);
  border-radius: 10px;
  border: 1px solid $hr-border-color;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  img {
    width: 100%;
    height: 100%;
    &.img-active {
      transform: translateX(-100%);
    }
  }
}
</style>
