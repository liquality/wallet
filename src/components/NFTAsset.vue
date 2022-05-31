<template>
  <div class="nft-image" style="--img-width: 100px">
    <Star :nftAsset="nftAsset" />
    <img :src="nftAssetImageSource" alt="" @click="viewNFTDetails" />
  </div>
</template>

<script>
import Star from '@/components/Star'
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
    }
  },
  computed: {
    nftAssetImageSource() {
      if (this.mode === 'thumbnail') {
        return this.nftAsset.image_thumbnail_url
      } else if (this.mode === 'preview') {
        return this.nftAsset.image_preview_url
      } else {
        return this.nftAsset.image_url
      }
    }
  },
  methods: {
    viewNFTDetails() {
      if (this.nftAsset) {
        this.$router.push({
          path: `/details/nft-asset/${this.nftAsset.name}`,
          query: { nftAsset: this.nftAsset }
        })
      }
    }
  }
}
</script>

<style lang="scss">
.nft-image {
  width: var(--img-width);
  border-radius: 10px;
  border: 1px solid $hr-border-color;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  img {
    &.img-active {
      transform: translateX(-100%);
    }
  }
}
</style>
