<template>
  <div class="nft-image" style="--img-width: 110px">
    <svg
      width="26"
      height="24"
      viewBox="0 0 26 24"
      :fill="nftAsset.starred ? '#FFE604' : 'none'"
      xmlns="http://www.w3.org/2000/svg"
      @click="toggleStarred"
    >
      <path
        d="M13 3.23607L14.9676 9.2918L15.1921 9.98278H15.9187H22.2861L17.1347 13.7254L16.547 14.1525L16.7715 14.8435L18.7391 20.8992L13.5878 17.1565L13 16.7295L12.4122 17.1565L7.2609 20.8992L9.22853 14.8435L9.45304 14.1525L8.86526 13.7254L3.71395 9.98278H10.0813H10.8079L11.0324 9.2918L13 3.23607Z"
        :fill="nftAsset.starred ? '#FFE604' : 'white'"
        stroke="#C4C4C4"
        stroke-width="2"
      />
    </svg>

    <img :src="nftAssetImageSource" alt="" @click="viewNFTDetails" />
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
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
    ...mapActions(['setStarredNFTs']),
    ...mapMutations(['SET_STARRED_NFTS']),
    viewNFTDetails() {
      if (this.nftAsset) {
        this.$router.push({
          path: `/details/nft-asset/${this.nftAsset.name}`,
          query: { nftAsset: this.nftAsset }
        })
      }
    },
    async toggleStarred() {
      this.nftAsset.starred = !this.nftAsset.starred
      this.SET_STARRED_NFTS(this.nftAsset)
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
  svg {
    position: absolute;
    top: 4px;
    left: 4px;
  }
  img {
    &.img-active {
      transform: translateX(-100%);
    }
  }
}
</style>
