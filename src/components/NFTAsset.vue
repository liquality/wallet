<template>
  <div class="nft-image" style="--img-width: 110px" @click="viewNFTDetails">
    <img :src="nftAssetImageSource" alt="" />
  </div>
</template>

<script>
export default {
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
  created() {
    console.log('NFTAsset created', this.nftAsset)
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
      this.$router.push({
        path: `/details/nft-collection/${this.nftAsset.collection.name}/${this.nftAsset.name}`,
        query: { nftAsset: this.nftAsset }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.nft-image {
  width: var(--img-width);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  img {
    &.img-active {
      transform: translateX(-100%);
    }
  }
}
</style>
