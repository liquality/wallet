<template>
  <div class="nft-image" style="--img-width: 100px">
    <Star :nftAsset="nftAsset" :accountId="accountId" />
    <img :src="nftAssetImageSource || thumbnailImage" alt="" @click="viewNFTDetails" />
  </div>
</template>

<script>
import Star from '@/components/Star'
import NFTThumbnailImage from '@/assets/nft_thumbnail.png'

export default {
  components: {
    Star
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
          path: `/details/nft-asset/${this.nftAsset.name}`,
          query: { nftAsset: this.nftAsset, accountId: this.accountId }
        })
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
