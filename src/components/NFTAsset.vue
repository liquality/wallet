<template>
  <div class="nft-image" style="--img-width: 110px" @click="viewNFTDetails">
    <img src="@/assets/images/nft.png" alt="" />
  </div>
</template>

<script>
export default {
  props: {
    nftAsset: {
      type: Object,
      required: true
    }
  },
  methods: {
    viewNFTDetails() {
      this.$router.push({
        path: `/details/nft-collection/${this.nftAsset.nft[0].collection}/${this.nftAsset.nft[0].name}`,
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
